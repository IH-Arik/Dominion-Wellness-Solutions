import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  StatusBar, 
  ScrollView, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Modal,
  FlatList,
  Alert,
  Animated
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, User, ChevronDown, Pencil, Check } from 'lucide-react-native';
import { FontFamily, FontSize } from '../src/constants/typography';
import Colors from '../src/constants/colors';
import { 
  useGetProfileQuery, 
  useUpdateProfileMutation,
  useGetOrganizationsQuery,
  useLazyGetDepartmentsQuery,
  useLazyGetTeamsQuery,
  useLazyGetRolesQuery
} from '../src/redux/rtk/authApi';
import { SafeAreaView } from 'react-native-safe-area-context';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
}

const FormField = ({ label, children }: FormFieldProps) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {children}
  </View>
);

interface InputProps {
  icon?: any;
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
  [key: string]: any;
}

const Input = ({ icon: Icon, placeholder, value, onChangeText, ...props }: InputProps) => (
  <View style={styles.inputContainer}>
    {Icon && <Icon size={20} color="#94A3B8" style={styles.inputIcon} />}
    <TextInput 
      style={styles.textInput} 
      placeholder={placeholder} 
      placeholderTextColor="#94A3B8"
      value={value}
      onChangeText={onChangeText}
      {...props}
    />
  </View>
);

interface SelectProps {
  placeholder: string;
  value?: string;
  onPress: () => void;
  loading?: boolean;
}

const Select = ({ placeholder, value, onPress, loading }: SelectProps) => (
  <TouchableOpacity style={styles.selectContainer} onPress={onPress} disabled={loading}>
    <Text style={[styles.selectText, !value && styles.placeholderText]}>
      {value || placeholder}
    </Text>
    {loading ? (
      <ActivityIndicator size="small" color={Colors.primary} />
    ) : (
      <ChevronDown size={20} color="#94A3B8" />
    )}
  </TouchableOpacity>
);

interface SelectionModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: { label: string; value: string }[];
  selectedValue?: string;
  onSelect: (value: string) => void;
}

const SelectionModal = ({ visible, onClose, title, options, selectedValue, onSelect }: SelectionModalProps) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{title}</Text>
        <FlatList
          data={options}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.optionItem} 
              onPress={() => {
                onSelect(item.value);
                onClose();
              }}
            >
              <Text style={[styles.optionText, selectedValue === item.value && styles.selectedOptionText]}>
                {item.label}
              </Text>
              {selectedValue === item.value && <Check size={18} color={Colors.primary} />}
            </TouchableOpacity>
          )}
          style={styles.optionsList}
        />
      </View>
    </TouchableOpacity>
  </Modal>
);

const EditProfileScreen = () => {
  const router = useRouter();
  
  // API Queries
  const { data: profileData, isLoading: isLoadingProfile } = useGetProfileQuery();
  const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();
  const { data: orgData, isLoading: isLoadingOrgs } = useGetOrganizationsQuery();
  const [triggerDepts, { data: deptsData, isLoading: isLoadingDepts }] = useLazyGetDepartmentsQuery();
  const [triggerTeams, { data: teamsData, isLoading: isLoadingTeams }] = useLazyGetTeamsQuery();
  const [triggerRoles, { data: rolesData, isLoading: isLoadingRoles }] = useLazyGetRolesQuery();

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [company, setCompany] = useState('');
  const [department, setDepartment] = useState('');
  const [team, setTeam] = useState('');
  const [role, setRole] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');

  // UI State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'gender' | 'company' | 'department' | 'team' | 'role' | null>(null);
  const [toastVisible] = useState(new Animated.Value(0));

  // Initialize form
  useEffect(() => {
    if (profileData?.data) {
      const p = profileData.data;
      setName(p.name || '');
      setAge(p.age?.toString() || '');
      setGender(p.gender || '');
      setCompany(p.company || '');
      setDepartment(p.department || '');
      setTeam(p.team || '');
      setRole(p.role || '');
      setHeight(p.height_cm?.toString() || '');
      setWeight(p.weight_kg?.toString() || '');

      // Trigger lazy loads for initial values
      if (p.company) {
        triggerDepts(p.company);
        triggerRoles(p.company);
        if (p.department) {
          triggerTeams({ organization_name: p.company, department: p.department });
        }
      }
    }
  }, [profileData]);

  const showToast = () => {
    Animated.sequence([
      Animated.timing(toastVisible, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastVisible, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        name,
        age: parseInt(age) || 0,
        gender,
        company,
        department,
        team,
        role,
        height_cm: parseFloat(height) || 0,
        weight_kg: parseFloat(weight) || 0,
      };

      await updateProfile(payload).unwrap();
      showToast();
    } catch (error: any) {
      Alert.alert("Error", error?.data?.message || "Failed to update profile. Please try again.");
    }
  };

  const openModal = (type: 'gender' | 'company' | 'department' | 'team' | 'role') => {
    setModalType(type);
    setModalVisible(true);
  };

  const genderOptions = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ];

  const modalOptions = useMemo(() => {
    switch (modalType) {
      case 'gender': return genderOptions;
      case 'company': return orgData?.data?.organizations || [];
      case 'department': return deptsData?.data?.departments || [];
      case 'team': return teamsData?.data?.teams || [];
      case 'role': return rolesData?.data?.roles || [];
      default: return [];
    }
  }, [modalType, orgData, deptsData, teamsData, rolesData]);

  const getModalTitle = () => {
    switch (modalType) {
      case 'gender': return 'Select Gender';
      case 'company': return 'Select Company';
      case 'department': return 'Select Department';
      case 'team': return 'Select Team';
      case 'role': return 'Select Work Role';
      default: return '';
    }
  };

  const handleSelect = (val: string) => {
    switch (modalType) {
      case 'gender': setGender(val); break;
      case 'company': 
        setCompany(val); 
        setDepartment(''); 
        setTeam(''); 
        setRole('');
        triggerDepts(val);
        triggerRoles(val);
        break;
      case 'department': 
        setDepartment(val); 
        setTeam('');
        triggerTeams({ organization_name: company, department: val });
        break;
      case 'team': setTeam(val); break;
      case 'role': setRole(val); break;
    }
  };

  if (isLoadingProfile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Avatar Section */}
          <View style={styles.avatarWrap}>
            <View style={styles.avatarCircle}>
              <User size={40} color="#FFFFFF" />
              <Text style={styles.avatarSubLabel}>USER PROFILE</Text>
            </View>
            <TouchableOpacity style={styles.editBadge}>
              <Pencil size={12} color="#FFFFFF" fill="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Form Section */}
          <FormField label="NAME">
            <Input 
              icon={User} 
              placeholder="Full Name" 
              value={name} 
              onChangeText={setName} 
            />
          </FormField>

          <View style={styles.row}>
            <View style={styles.column}>
              <FormField label="AGE">
                <Input 
                  placeholder="Age" 
                  keyboardType="numeric" 
                  value={age} 
                  onChangeText={setAge} 
                />
              </FormField>
            </View>
            <View style={styles.column}>
              <FormField label="GENDER">
                <Select 
                  placeholder="Select" 
                  value={gender} 
                  onPress={() => openModal('gender')} 
                />
              </FormField>
            </View>
          </View>

          <FormField label="COMPANY">
            <Select 
              placeholder="Select Company" 
              value={company} 
              onPress={() => openModal('company')} 
              loading={isLoadingOrgs}
            />
          </FormField>

          <FormField label="DEPARTMENT">
            <Select 
              placeholder="Select Department" 
              value={department} 
              onPress={() => openModal('department')} 
              loading={isLoadingDepts}
            />
          </FormField>

          <FormField label="TEAM">
            <Select 
              placeholder="Select Team" 
              value={team} 
              onPress={() => openModal('team')} 
              loading={isLoadingTeams}
            />
          </FormField>

          <FormField label="WORK ROLE">
            <Select 
              placeholder="Select Role" 
              value={role} 
              onPress={() => openModal('role')} 
              loading={isLoadingRoles}
            />
          </FormField>

          <View style={styles.row}>
            <View style={styles.column}>
              <FormField label="HEIGHT (CM)">
                <Input 
                  placeholder="180" 
                  keyboardType="numeric" 
                  value={height} 
                  onChangeText={setHeight} 
                />
              </FormField>
            </View>
            <View style={styles.column}>
              <FormField label="WEIGHT (KG)">
                <Input 
                  placeholder="75" 
                  keyboardType="numeric" 
                  value={weight} 
                  onChangeText={setWeight} 
                />
              </FormField>
            </View>
          </View>

          {/* Buttons Section */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()} disabled={isUpdating}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.saveButton, isUpdating && styles.disabledButton]} 
              onPress={handleSave} 
              disabled={isUpdating}
            >
              {isUpdating ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SelectionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={getModalTitle()}
        options={modalOptions}
        selectedValue={
          modalType === 'gender' ? gender :
          modalType === 'company' ? company :
          modalType === 'department' ? department :
          modalType === 'team' ? team :
          modalType === 'role' ? role : undefined
        }
        onSelect={handleSelect}
      />

      {/* Toast Component */}
      <Animated.View style={[styles.toast, { opacity: toastVisible }]}>
        <View style={styles.toastInner}>
          <Check size={20} color={Colors.white} />
          <Text style={styles.toastText}>Profile updated successfully!</Text>
        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F6FCFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6FCFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.lg,
    color: '#1E293B',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  avatarWrap: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 40,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5C4A7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#F1F5F9',
  },
  avatarSubLabel: {
    fontSize: 6,
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    marginTop: 2,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  inputContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: '#1E293B',
    height: '100%',
  },
  selectContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  selectText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: '#1E293B',
  },
  placeholderText: {
    color: '#94A3B8',
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  column: {
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#94A3B8',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  saveButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.white,
  },
  disabledButton: {
    opacity: 0.7,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsList: {
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: '#475569',
  },
  selectedOptionText: {
    color: Colors.primary,
    fontFamily: FontFamily.bold,
  },
  // Toast Styles
  toast: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 999,
  },
  toastInner: {
    backgroundColor: Colors.success,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  toastText: {
    color: Colors.white,
    fontFamily: FontFamily.bold,
    fontSize: 14,
    marginLeft: 8,
  },
});

export default EditProfileScreen;
