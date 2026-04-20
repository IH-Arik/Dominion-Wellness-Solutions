import json
import os

path = r'c:\Users\IH ARIK\Desktop\ARIK\Welldomain\Welldomain_API.postman_collection.json'

with open(path, 'r', encoding='utf-8') as f:
    collection = json.load(f)

def update_request_obj(request):
    if "url" in request and isinstance(request["url"], dict):
        url = request["url"]
        if "raw" in url:
            # Replace /api/v1/ with /
            url["raw"] = url["raw"].replace("/api/v1/", "/")
            # Also handle if it's at the end without trailing slash (unlikely but safe)
            if url["raw"].endswith("/api/v1"):
                url["raw"] = url["raw"][:-7]
        
        if "path" in url:
            path_list = url["path"]
            # Remove "api" and "v1" from path if they are at the start
            if len(path_list) >= 2 and path_list[0] == "api" and path_list[1] == "v1":
                url["path"] = path_list[2:]

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

if "item" in collection:
    for item in collection["item"]:
        update_item(item)

with open(path, 'w', encoding='utf-8') as f:
    json.dump(collection, f, indent=2)

print("Postman collection updated: all /api/v1 prefixes removed.")
