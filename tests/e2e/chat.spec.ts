import { test, expect } from '@playwright/test';

test.describe('RAG Chat Feature', () => {
  test.beforeEach(async ({ page }) => {
    // テスト用のログイン処理
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test1234!');
    await page.click('button[type="submit"]');
    
    // ログイン成功を待つ
    await page.waitForURL('/', { timeout: 10000 });
    
    // チャットページへ移動
    await page.goto('/chat');
    await page.waitForLoadState('networkidle');
  });

  test('should display chat page with correct elements', async ({ page }) => {
    // ページタイトルを確認
    await expect(page.locator('h1')).toContainText('AI アシスタント');
    
    // 入力エリアが存在することを確認
    const textarea = page.locator('textarea[placeholder*="質問を入力"]');
    await expect(textarea).toBeVisible();
    
    // 送信ボタンが存在することを確認
    const sendButton = page.locator('button[title*="送信"]');
    await expect(sendButton).toBeVisible();
    
    // 設定ボタンが存在することを確認
    await expect(page.getByText('設定')).toBeVisible();
    
    // クリアボタンが存在することを確認
    await expect(page.getByText('クリア')).toBeVisible();
  });

  test('should send a message and receive response', async ({ page }) => {
    // 質問を入力
    const question = 'RAGシステムとは何ですか？';
    await page.fill('textarea[placeholder*="質問を入力"]', question);
    
    // 送信ボタンをクリック
    await page.click('button[title*="送信"]');
    
    // ユーザーメッセージが表示されることを確認
    await expect(page.locator('text=' + question)).toBeVisible();
    
    // AIの応答を待つ（ローディング表示）
    await expect(page.locator('text=AI が考えています')).toBeVisible();
    
    // 応答が表示されることを確認（タイムアウト30秒）
    await expect(page.locator('text=AI アシスタント').nth(1)).toBeVisible({ timeout: 30000 });
    
    // 信頼度が表示されることを確認
    await expect(page.locator('text=信頼度:')).toBeVisible({ timeout: 5000 });
  });

  test('should display citations when available', async ({ page }) => {
    // 質問を入力
    const question = '文書の内容について教えてください';
    await page.fill('textarea[placeholder*="質問を入力"]', question);
    
    // 送信
    await page.click('button[title*="送信"]');
    
    // 応答を待つ
    await page.waitForSelector('text=AI アシスタント', { timeout: 30000 });
    
    // 引用情報が表示される場合、確認
    const citations = page.locator('text=参照文書:');
    if (await citations.isVisible()) {
      // 引用カードが存在することを確認
      await expect(page.locator('.border.rounded-lg.p-3')).toBeVisible();
    }
  });

  test('should handle error gracefully', async ({ page }) => {
    // 長すぎる質問を入力（1000文字以上）
    const longQuestion = 'a'.repeat(1001);
    await page.fill('textarea[placeholder*="質問を入力"]', longQuestion);
    
    // 送信を試みる
    await page.click('button[title*="送信"]');
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=質問は1000文字以内で入力してください')).toBeVisible();
  });

  test('should clear chat history', async ({ page }) => {
    // メッセージを送信
    await page.fill('textarea[placeholder*="質問を入力"]', 'テストメッセージ');
    await page.click('button[title*="送信"]');
    
    // メッセージが表示されることを確認
    await expect(page.locator('text=テストメッセージ')).toBeVisible();
    
    // クリアボタンをクリック
    await page.click('text=クリア');
    
    // メッセージが消えることを確認
    await expect(page.locator('text=テストメッセージ')).not.toBeVisible();
    
    // ウェルカムメッセージが表示されることを確認
    await expect(page.locator('text=RAG システムへようこそ')).toBeVisible();
  });

  test('should change settings', async ({ page }) => {
    // 設定ボタンをクリック
    await page.click('text=設定');
    
    // 設定パネルが表示されることを確認
    await expect(page.locator('text=チャット設定')).toBeVisible();
    
    // 検索タイプを変更
    await page.click('#search-type');
    await page.click('text=キーワード検索');
    
    // 検索結果数を変更
    await page.click('#max-results');
    await page.click('text=10件');
    
    // 設定を閉じる
    await page.click('button[aria-label*="Close"]');
    
    // 設定パネルが閉じることを確認
    await expect(page.locator('text=チャット設定')).not.toBeVisible();
  });

  test('should send message with keyboard shortcut', async ({ page }) => {
    // 質問を入力
    const question = 'ショートカットテスト';
    await page.fill('textarea[placeholder*="質問を入力"]', question);
    
    // Ctrl+Enter (または Cmd+Enter on Mac) を押す
    await page.keyboard.press('Control+Enter');
    
    // メッセージが送信されることを確認
    await expect(page.locator('text=' + question)).toBeVisible();
  });

  test('should cancel ongoing request', async ({ page }) => {
    // 質問を送信
    await page.fill('textarea[placeholder*="質問を入力"]', 'キャンセルテスト');
    await page.click('button[title*="送信"]');
    
    // ローディング中にキャンセルボタンが表示されることを確認
    const cancelButton = page.locator('button[title="キャンセル"]');
    await expect(cancelButton).toBeVisible();
    
    // キャンセルボタンをクリック
    await cancelButton.click();
    
    // ローディングが消えることを確認
    await expect(page.locator('text=AI が考えています')).not.toBeVisible();
  });

  test('should display streaming response', async ({ page }) => {
    // 設定でストリーミングを有効にする
    await page.click('text=設定');
    await page.click('#streaming');
    await page.click('text=ストリーミング（リアルタイム）');
    await page.click('button[aria-label*="Close"]');
    
    // 質問を送信
    await page.fill('textarea[placeholder*="質問を入力"]', 'ストリーミングテスト');
    await page.click('button[title*="送信"]');
    
    // ストリーミング中のアニメーションが表示されることを確認
    // （テキストが徐々に表示される様子は実際の実装に依存）
    await expect(page.locator('.animate-pulse')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to document from citation', async ({ page }) => {
    // 引用がある回答を得るための質問
    await page.fill('textarea[placeholder*="質問を入力"]', '文書について教えてください');
    await page.click('button[title*="送信"]');
    
    // 応答と引用を待つ
    await page.waitForSelector('text=参照文書:', { timeout: 30000 });
    
    // 「文書を開く」リンクをクリック
    const documentLink = page.locator('a:has-text("文書を開く")').first();
    if (await documentLink.isVisible()) {
      await documentLink.click();
      
      // 文書ページに遷移することを確認
      await expect(page.url()).toContain('/documents/');
    }
  });
});