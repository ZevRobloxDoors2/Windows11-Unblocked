import re
with open('src/App.tsx', 'r') as f: content = f.read()
content = content.replace('<option value="blob">Blob: Protocol (Recommended)</option>\n                      <option value="filesystem">Filesystem: Protocol</option>\n                      <option value="blob">Blob (Recommended)</option>\n                      <option value="filesystem">Filesystem (Unrecommended - some games might not work)</option>', '<option value="blob">Blob: Protocol (Recommended)</option>\n                      <option value="filesystem">Filesystem: Protocol</option>')
with open('src/App.tsx', 'w') as f: f.write(content)
