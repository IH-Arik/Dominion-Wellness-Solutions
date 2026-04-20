import json

def update_request_obj(request):
    if "url" in request and isinstance(request["url"], dict):
        url = request["url"]
        if "raw" in url:
            url["raw"] = url["raw"].replace("/api/v1/", "/")
        if "path" in url:
            path = url["path"]
            if len(path) >= 2 and path[0] == "api" and path[1] == "v1":
                url["path"] = path[2:]

def update_item(item):
    if "request" in item:
        update_request_obj(item["request"])
    
    if "response" in item:
        for resp in item["response"]:
            if isinstance(resp, dict) and "originalRequest" in resp:
                update_request_obj(resp["originalRequest"])
    
    if "item" in item:
        for sub_item in item["item"]:
            update_item(sub_item)

def main():
    input_file = r"C:\Users\IH ARIK\.gemini\antigravity\brain\532378ed-6953-4a4a-ad7d-46242369bbd8\.system_generated\steps\15\output.txt"
    output_file = r"C:\Users\IH ARIK\Desktop\ARIK\Welldomain\scratch\updated_collection.json"
    
    with open(input_file, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    collection = data["collection"]
    if "item" in collection:
        for item in collection["item"]:
            update_item(item)
    
    # Remove metadata that might conflict during PUT
    # According to tool docs: "To copy another collection's contents to the given collection, remove all ID values... These values include the id, uid, and postman_id values."
    # But wait, I'm UPDATING an existing collection.
    # The putCollection tool says: "Include the collection's ID values in the request body. If you do not, the endpoint removes the existing items and creates new items."
    # So I SHOULD keep them if I want to update correctly.
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"Updated collection saved to {output_file}")

if __name__ == "__main__":
    main()
