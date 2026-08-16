# nextage-counting

本当のNEXTAGE祭の集計

## セットアップ

1. Google Apps Scriptを開き、APIをオンにする
2. `git clone ***`
3. `npm install`
4. `npx clasp login`でログイン

> [!CAUTION]
> claspコマンド実行時は`npx clasp ***`という形式にする

## 実行方法

GASのトリガーまたはGitHub Actionsから毎日AM 5時以降に以下を実行

```bash
npx clasp run runFetchAndWrite
```

9/31 AM5時以降、任意のタイミングで以下を実行

```bash
npx clasp runCompareAndWrite
```
