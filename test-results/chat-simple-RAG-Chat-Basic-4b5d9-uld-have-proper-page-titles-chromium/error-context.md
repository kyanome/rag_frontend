# Page snapshot

```yaml
- text: ログイン RAGシステムにログインしてください メールアドレス
- textbox "メールアドレス"
- text: パスワード
- textbox "パスワード"
- button "ログイン"
- paragraph:
  - text: アカウントをお持ちでない方は
  - link "新規登録":
    - /url: /register
- region "Notifications alt+T"
- status
- alert
```