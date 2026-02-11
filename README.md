# SUTOU Test Site

テストサイト。株式会社 SUTOU のウェブサイトのプロトタイプ・デモ版です。

## 📁 プロジェクト構造

```
test-site/
├── README.md              # このファイル
├── test/                  # サイトのメインファイル
│   ├── index.html        # トップページ
│   ├── style.css         # スタイルシート
│   └── img/              # 画像フォルダ
│       ├── common/       # 共通画像
│       ├── news/         # ニュースページ用
│       └── column/       # コラム用
└── .git/                 # Git リポジトリ
```

## 🚀 セットアップ

### ローカルサーバーの起動

```bash
cd test-site/test
python3 -m http.server 8000
```

http://localhost:8000 でサイトにアクセス可能

### 外部公開（ngrok を使用）

```bash
ngrok http 8000
```

生成された URL を他人と共有

## 📝 修正履歴

- CSS エラー（64件）を修正
- 背景画像をダミー画像に置き換え
- HTML タグの修正
- 画像パスの統一（./img/ に統一）

## 🔗 現在のプレビュー

- ローカル: http://localhost:8000/test/index.html
- ngrok パブリックURL: https://withdrawable-pierce-pluggingly.ngrok-free.dev