# github-action-ftp-upload-file

This action uploads the file to the ftp(s) server.

## Example usage

```yml
- name: Upload
  id: upload
  uses: Kaven-Universe/github-action-ftp-upload-file@v1.0.1
  with:
    host: localhost
    port: 21
    user: anonymous
    password: ******
    secure: false
    file: "name.txt"
    rename-file-to: "newName.txt"
    json_stringify_data: '["file1","file2","..."]'
```
