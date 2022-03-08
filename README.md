# github-action-ftp-upload-file

This action uploads the file to the [http(s) server](https://github.com/Kaven-Universe/kaven-file-server).

## Example usage

```yml
- name: Upload
  id: upload
  uses: Kaven-Universe/github-action-ftp-upload-file@v1.0.18
  with:
    server: http://server.com/file
    file: "xxx"
    rename-file-to: "new file name"
    json_stringify_data: '[{"key":"k1","value":"v1"},{"key":"k2","value":"v2"}]'
```
