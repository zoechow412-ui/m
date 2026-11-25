# 恒輝建築｜Facebook 專頁自動發佈

**預設完全不會自動發文。** 五篇貼文是未批准的草稿（`approved: false`）。圖片和 Facebook Page 存取授權尚未配置。

## 只需設定一次

1. 取得你有管理權限的 Facebook **專頁** ID 及 Meta Graph API Page Access Token；需要 Meta 要求的 `pages_manage_posts` 及其他適用權限。不可用私人個人動態帳戶發佈。請勿在 GitHub 程式或聊天中貼 Token。
2. 在 GitHub `zoechow412-ui/m` → Settings → Secrets and variables → Actions → **Secrets**，新增 `FB_PAGE_ID`、`FB_PAGE_ACCESS_TOKEN`。
3. 將已確認的 FB 單張廣告圖（JPG/PNG）放在 `unibright-ops/facebook-autopost/assets/`，命名配合 `queue.json` 的 `image_path`；亦可改用可公開讀取的 HTTPS `image_url`。ChatGPT sandbox 圖片地址並非公開託管網址。
4. 逐篇檢查文案、新聞日期、版權、Logo、法例及圖片，才把相應 `approved` 改成 `true`。可以用有時區時間字串填 `publish_after`，例如 `2026-11-26T10:30:00+08:00`；`null` 表示下一次有機會就可發。
5. GitHub Actions → **Unibright Facebook Page Auto Publish** → Run workflow，先用 `dry_run=true` 預覽。確認後，在 Secrets and variables → Actions → **Variables** 新增 `FB_AUTOPUBLISH_ENABLED`，值為 `true`。

## 執行規則

- 每日 **香港時間10:33** 執行（02:33 UTC），每次最多發一篇，跟 `queue.json` 排序。
- 只會發佈 `approved: true`、時間已到、未出現於 `published.json` 的貼文，而且必須有圖片。
- 預設 dry-run（即使 Github Actions 日常排程啟動），直到上面變數及專頁授權、圖片全部配置完成。
- 成功發佈後，將 Facebook 回傳的 photo ID 記入 `published.json` 並提交至 GitHub；如 Meta 已成功發佈但儲存記錄失敗，重跑前要先檢查專頁避免重複。
- GitHub cron 可能延遲，亦可能因 public repo 久無活動而停用；唔保證精準分鐘。
- 新聞熱話研究/文案或圖片生成**不是本系統的功能**；需先經審核加到 queue，之後 GitHub 才可自動發佈。

參考：[Meta Page Photos](https://developers.facebook.com/docs/graph-api/reference/page/photos/)｜[Meta Page Feed](https://developers.facebook.com/docs/graph-api/reference/page/feed/)｜[GitHub schedule](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
