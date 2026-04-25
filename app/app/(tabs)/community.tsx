import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  ActivityIndicator,
  Animated,
  Keyboard,
  Easing,
  KeyboardEvent,
  KeyboardAvoidingView,
} from "react-native";
import { X, Mic, ArrowUp } from "lucide-react-native";
import { FontFamily } from "../../src/constants/typography";
import { useNavigation } from "@react-navigation/native";
import { 
  useGetChatGreetingQuery, 
  useGetChatHistoryQuery, 
  useGetChatSuggestionsQuery, 
  useSendChatMessageMutation 
} from "../../src/redux/rtk/aiApi";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AnimatedTypingDots from "../../src/components/AnimatedTypingDots";
import TypewriterText from "../../src/components/TypewriterText";

import { ChatHistorySkeleton } from "../../src/components/ChatHistorySkeleton";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const [inputText, setInputText] = useState("");
  const [lastAnimatedIndex, setLastAnimatedIndex] = useState(-1);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  // Animated value for keyboard height
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  const { data: greetingData } = useGetChatGreetingQuery();
  const { data: historyData, isLoading: historyLoading, isFetching: isHistoryFetching } = useGetChatHistoryQuery();
  const { data: suggestionsData } = useGetChatSuggestionsQuery();
  const [sendMessage, { isLoading: isSending }] = useSendChatMessageMutation();

  const messages = historyData?.data?.messages || [];
  const suggestions = suggestionsData?.data?.suggestions || [];
  const greeting = greetingData?.data;

  // Keyboard Animation Setup
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onKeyboardShow = (e: KeyboardEvent) => {
      const targetValue = Platform.OS === "ios" 
        ? e.endCoordinates.height - insets.bottom 
        : 0;

      Animated.timing(keyboardHeight, {
        toValue: targetValue,
        duration: e.duration || 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false, // Padding/height cannot use native driver
      }).start();
      
      // Also scroll to bottom when keyboard opens
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 50);
    };

    const onKeyboardHide = (e: KeyboardEvent) => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: e.duration || 250,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    };

    const showSubscription = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideSubscription = Keyboard.addListener(hideEvent, onKeyboardHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [insets.bottom]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, isSending]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || inputText;
    if (!textToSend.trim() || isSending) return;

    setPendingMessage(textToSend);
    setInputText("");
    try {
      await sendMessage({ message: textToSend }).unwrap();
    } catch (error) {
      console.error("Failed to send message:", error);
      setPendingMessage(null);
    }
  };

  // Clear pending message only after history has finished refreshing
  useEffect(() => {
    if (!isSending && !isHistoryFetching && pendingMessage) {
      setPendingMessage(null);
    }
  }, [isSending, isHistoryFetching, pendingMessage]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      {/* ─── Floating Header Card ─── */}
      <View style={[styles.headerCard, { marginTop: insets.top + 16 }]}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIconBg}>
            <Text style={styles.headerIconText}>✜</Text> 
          </View>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>{greeting?.title || "DWS AI Assistant"}</Text>
            <View style={styles.onlineWrap}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>{greeting?.status || "Online"}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <X size={18} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Loading History Skeleton */}
        {historyLoading && <ChatHistorySkeleton />}

        {/* Initial Greeting if no history */}
        {messages.length === 0 && !historyLoading && greeting?.greeting_message && (
          <View style={styles.msgContainerLeft}>
            <View style={[styles.msgBubbleLeft, styles.cornerSharpTopLeft]}>
              <TypewriterText 
                text={greeting.greeting_message}
                style={styles.msgTextLeft}
                enabled={true}
              />
            </View>
          </View>
        )}

        {/* Message History */}
        {messages.map((msg, index) => {
          const isAI = msg.role === "assistant";
          const isLast = index === messages.length - 1;
          const shouldAnimate = isAI && isLast && index > lastAnimatedIndex;

          return (
            <View key={index} style={isAI ? styles.msgContainerLeft : styles.msgContainerRight}>
              <View style={[
                isAI ? styles.msgBubbleLeft : styles.msgBubbleRight,
                isAI ? styles.cornerSharpTopLeft : styles.cornerSharpBottomRight
              ]}>
                {isAI ? (
                  <TypewriterText 
                    text={msg.content}
                    style={styles.msgTextLeft}
                    enabled={shouldAnimate}
                    onComplete={() => setLastAnimatedIndex(index)}
                  />
                ) : (
                  <Text style={styles.msgTextRight}>{msg.content}</Text>
                )}
              </View>
              <Text style={isAI ? styles.msgTimeLeft : styles.msgTimeRight}>
                {formatTime(msg.created_at)}
              </Text>
            </View>
          );
        })}

        {/* Pending User Message */}
        {(isSending || isHistoryFetching) && pendingMessage && (
          <View style={styles.msgContainerRight}>
            <View style={[styles.msgBubbleRight, styles.cornerSharpBottomRight]}>
              <Text style={styles.msgTextRight}>{pendingMessage}</Text>
            </View>
            <Text style={styles.msgTimeRight}>
              {isSending ? "Sending..." : "Syncing..."}
            </Text>
          </View>
        )}

        {/* Typing indicator */}
        {isSending && (
          <View style={styles.msgContainerLeft}>
            <View style={styles.typingBubble}>
              <AnimatedTypingDots />
            </View>
          </View>
        )}

        {/* Spacer to push suggestions to bottom if screen is tall */}
        <View style={{ flex: 1, minHeight: 40 }} />

        {/* Suggested Queries */}
        {!isSending && suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            {suggestions.map((sug, idx) => (
              <TouchableOpacity 
                key={idx} 
                style={styles.suggestionPill}
                onPress={() => handleSend(sug.text)}
              >
                <Text style={styles.suggestionText}>{sug.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={[
        styles.inputContainer, 
        { 
          paddingBottom: Math.max(insets.bottom, 16) 
        }
      ]}>
        <View style={styles.inputWrapper}>
          <TouchableOpacity 
            style={styles.micBtn}
            onPress={() => alert("Voice input feature coming soon!")}
          >
            <Mic size={22} color="#6B7280" />
          </TouchableOpacity>
          
          <TextInput
            style={[styles.textInput, Platform.OS === 'web' && ({ outlineStyle: 'none' } as any)]}
            placeholder="Type your message..."
            placeholderTextColor="#9CA3AF"
            underlineColorAndroid="transparent"
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => handleSend()}
            returnKeyType="send"
          />
          
          <TouchableOpacity 
            style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]} 
            onPress={() => handleSend()}
            disabled={!inputText.trim() || isSending}
          >
            {isSending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <ArrowUp size={20} color="#FFFFFF" strokeWidth={3} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6FCFB", // Very light tint matching Dominion theme
  },
  headerCard: {
    backgroundColor: "#001F3F", // Deep dark blue card
    marginHorizontal: 16,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#0D4A52", // Dark teal background for logo
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconText: {
    color: "#00A896",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerTextWrap: {
    justifyContent: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontFamily: FontFamily.bold,
    fontSize: 16,
    letterSpacing: 0.3,
  },
  onlineWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#00A896", // Bright teal online indicator
  },
  onlineText: {
    color: "#9CA3AF",
    fontFamily: FontFamily.regular,
    fontSize: 12,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#112B4B", // Slightly lighter overlay for close button
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 24,
    flexGrow: 1,
  },
  msgContainerLeft: {
    alignItems: "flex-start",
    marginBottom: 16,
    maxWidth: "85%",
  },
  msgContainerRight: {
    alignItems: "flex-end",
    marginBottom: 16,
    maxWidth: "85%",
    alignSelf: "flex-end",
  },
  msgBubbleLeft: {
    backgroundColor: "#F3F5F7", // Very light grayish blue
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
  },
  msgBubbleRight: {
    backgroundColor: "#00A896", // Teal user bubble
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
  },
  cornerSharpTopLeft: {
    borderTopLeftRadius: 4,
  },
  cornerSharpBottomRight: {
    borderBottomRightRadius: 4,
  },
  msgTextLeft: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: "#2C3E50",
    lineHeight: 22,
  },
  msgTextRight: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    color: "#FFFFFF",
    lineHeight: 22,
  },
  msgTimeLeft: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 6,
  },
  msgTimeRight: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 6,
  },
  typingBubble: {
    backgroundColor: "#F3F5F7",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  suggestionsContainer: {
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 8,
  },
  suggestionPill: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#B4E4DF", // Very faint teal border
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  suggestionText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: "#00A896",
  },
  inputContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  micBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 15,
    color: "#2C3E50",
    marginHorizontal: 8,
    maxHeight: 100,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#00A896", // Teal arrow button
    alignItems: "center",
    justifyContent: "center",
  },
});
