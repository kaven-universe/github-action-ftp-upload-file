# github-action-ftp-upload-file

This action uploads the file to the ftp(s) server.

## Example usage

```yml
- name: Upload
  id: upload
  uses: kaven-universe/github-action-ftp-upload-file@v1
  with:
    host: ftp-server.com
    port: 21
    user: anonymous
    password: "******"
    secure: false
    file: "name.txt"
    rename-file-to: "newName.txt"
    files: '["file1","file2","..."]'
    cwd: 'remote/dir'
    retry: 0
```
