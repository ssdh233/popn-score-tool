# ポップンスコアツール

※使用は自己責任でお願いします。

[ポップンスコアツール](https://ssdh233.github.io/popn-score-tool/)

## 機能

- ポップンのスコアデータを保存 (JSON 形式)
- 保存したスコアデータ (JSON 形式) を閲覧

## 使い方

1. 「[ポップンスコアツール](https://ssdh233.github.io/popn-score-tool/)」ページ内にあるブックマークレットをブックマークに登録します。
1. `https://p.eagate.573.jp/` 上でブックマークレットを実行するとスコアデータの取得が開始されます。  
ログイン状態かつ e-amusement 有料サービスに加入している必要があります。  
取得に成功するとスコアデータ (JSON 形式) の保存が開始されます。  
(サーバーに負荷がかかるので、続けて何度も実行しないでください。)  
(スマートフォンやブラウザによって起動方法が異なる場合があります。)
1. 「[ポップンスコアツール](https://ssdh233.github.io/popn-score-tool/)」ページ内にあるビューアを用いて、保存したスコアデータ (JSON 形式) を開いて表示します。  
※本ツールでは未プレーのデータは表示されません。  
※本ツールでは UPPER 表記は付きません。

## 本ツールの仕様

- スコアデータ
	- 保存する: 楽曲および譜面ごとのリザルト (メダル・ランク・点数)
	- 保存しない: ユーザー情報、プレー回数、など
- ビューア
	- 譜面難易度タイプ (EASY, NORMAL, HYPER, EX) 別、メダル別、ランク別の曲数
	- 譜面難易度タイプ (EASY, NORMAL, HYPER, EX) 別、メダル別、ランク別のリザルトの一覧

※将来的に仕様変更や機能追加等をする可能性があります。

## ライセンス

[MIT License](/LICENSE)
