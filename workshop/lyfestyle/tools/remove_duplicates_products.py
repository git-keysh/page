import json
from collections import OrderedDict

# Load products.json
with open('products.json', 'r', encoding='utf-8') as f:
    products = json.load(f)

# Remove duplicates by id, keeping the first occurrence
seen = set()
unique_products = []
for product in products:
    pid = product.get('id')
    if pid and pid not in seen:
        unique_products.append(product)
        seen.add(pid)

# Save cleaned list back to products.json
with open('products.json', 'w', encoding='utf-8') as f:
    json.dump(unique_products, f, indent=2, ensure_ascii=False)

print(f"Removed duplicates. {len(products) - len(unique_products)} duplicates found.")
