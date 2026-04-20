import json

path = r'c:\Users\IH ARIK\Desktop\ARIK\Welldomain\Welldomain_API.postman_collection.json'

with open(path, 'r', encoding='utf-8') as f:
    coll = json.load(f)

# Keep only the essential structure for createCollection tool
# Top level: collection: { info, item, variable }
payload = {
    "collection": {
        "info": coll.get("info", {}),
        "item": coll.get("item", []),
        "variable": coll.get("variable", [])
    }
}

# The Postman API schema for createCollection might be slightly different from the export file
# Export file has info, item, variable at root.
# createCollection tool takes 'collection' object with those inside.

# Let's check size
json_str = json.dumps(payload)
print(f"Payload size: {len(json_str)} bytes")

# If it's too big, we might need to truncate for the tool call
# But let's try to print the first bit to confirm structure
print(json.dumps(payload, indent=2)[:2000])
