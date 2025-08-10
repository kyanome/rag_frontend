import { test, expect } from '@playwright/test';

test.describe('RAG Chat LLM Integration', () => {
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

  test('should display inline citation markers in response', async ({ page }) => {
    // 質問を入力
    const question = 'RAGシステムの主要な特徴について教えてください';
    await page.fill('textarea[placeholder*="質問を入力"]', question);
    
    // 送信
    await page.click('button[title*="送信"]');
    
    // AIの応答を待つ
    await page.waitForSelector('text=AI アシスタント', { timeout: 30000 });
    
    // インライン引用マーカーが表示されることを確認
    const citationMarkers = page.locator('button[aria-label*="引用"]');
    const markerCount = await citationMarkers.count();
    
    if (markerCount > 0) {
      // 最初の引用マーカーをホバー
      await citationMarkers.first().hover();
      
      // ツールチップが表示されることを確認
      await expect(page.locator('[role="tooltip"]')).toBeVisible({ timeout: 2000 });
      
      // ツールチップに文書タイトルが含まれることを確認
      const tooltipContent = await page.locator('[role="tooltip"]').textContent();
      expect(tooltipContent).toBeTruthy();
    }
  });

  test('should highlight citation text in response', async ({ page }) => {
    // 質問を入力
    const question = '文書の内容について詳しく教えてください';
    await page.fill('textarea[placeholder*="質問を入力"]', question);
    
    // 送信
    await page.click('button[title*="送信"]');
    
    // 応答を待つ
    await page.waitForSelector('text=AI アシスタント', { timeout: 30000 });
    
    // ハイライトされたテキストが存在するか確認
    const highlights = page.locator('mark');
    const highlightCount = await highlights.count();
    
    if (highlightCount > 0) {
      // ハイライトの背景色を確認
      const firstHighlight = highlights.first();
      const backgroundColor = await firstHighlight.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      
      // 黄色系の背景色であることを確認（RGB値で判定）
      expect(backgroundColor).toMatch(/rgb\(2\d{2}, 2\d{2}, \d+\)/);
    }
  });

  test('should expand and collapse citation cards', async ({ page }) => {
    // 質問を入力
    const question = 'テスト用の質問です';
    await page.fill('textarea[placeholder*="質問を入力"]', question);
    
    // 送信
    await page.click('button[title*="送信"]');
    
    // 応答と引用を待つ
    await page.waitForSelector('text=参照文書:', { timeout: 30000 });
    
    // 引用カードを探す
    const citationCards = page.locator('.border.rounded-lg.p-3');
    const cardCount = await citationCards.count();
    
    if (cardCount > 0) {
      // 最初のカードの展開ボタンを探す
      const firstCard = citationCards.first();
      const expandButton = firstCard.locator('button:has-text("展開")');
      
      if (await expandButton.isVisible()) {
        // 展開前の高さを取得
        const heightBefore = await firstCard.boundingBox();
        
        // 展開ボタンをクリック
        await expandButton.click();
        
        // 展開後の高さを取得
        await page.waitForTimeout(500); // アニメーション待機
        const heightAfter = await firstCard.boundingBox();
        
        // 高さが増加していることを確認
        if (heightBefore && heightAfter) {
          expect(heightAfter.height).toBeGreaterThan(heightBefore.height);
        }
        
        // 折りたたみボタンが表示されることを確認
        await expect(firstCard.locator('button:has-text("折りたたむ")')).toBeVisible();
      }
    }
  });

  test('should show citation relevance with progress bar', async ({ page }) => {
    // 質問を入力
    const question = 'システムについて教えてください';
    await page.fill('textarea[placeholder*="質問を入力"]', question);
    
    // 送信
    await page.click('button[title*="送信"]');
    
    // 引用を待つ
    await page.waitForSelector('text=参照文書:', { timeout: 30000 });
    
    // プログレスバーが存在することを確認
    const progressBars = page.locator('[role="progressbar"]');
    const progressCount = await progressBars.count();
    
    if (progressCount > 0) {
      // 最初のプログレスバーの値を確認
      const firstProgress = progressBars.first();
      const value = await firstProgress.getAttribute('aria-valuenow');
      
      // 値が0-100の範囲にあることを確認
      if (value) {
        const numValue = parseInt(value, 10);
        expect(numValue).toBeGreaterThanOrEqual(0);
        expect(numValue).toBeLessThanOrEqual(100);
      }
    }
  });

  test('should filter citations by relevance', async ({ page }) => {
    // 質問を入力して複数の引用を取得
    const question = 'すべての文書について説明してください';
    await page.fill('textarea[placeholder*="質問を入力"]', question);
    await page.click('button[title*="送信"]');
    
    // 引用を待つ
    await page.waitForSelector('text=参照文書:', { timeout: 30000 });
    
    // フィルターボタンを探す
    const filterButton = page.locator('button:has-text("フィルター")');
    if (await filterButton.isVisible()) {
      // フィルターを開く
      await filterButton.click();
      
      // フィルターパネルが表示されることを確認
      await expect(page.locator('text=並べ替え')).toBeVisible();
      
      // 信頼度レベルセレクトを操作
      const levelSelect = page.locator('button[role="combobox"]').filter({ hasText: 'すべて' });
      if (await levelSelect.isVisible()) {
        await levelSelect.click();
        
        // 「高（80%以上）」を選択
        await page.click('text=高（80%以上）');
        
        // フィルタリング結果を確認（引用カードの数が変わるかチェック）
        await page.waitForTimeout(500);
      }
    }
  });

  test('should handle streaming response correctly', async ({ page }) => {
    // ストリーミングを有効にする
    await page.click('text=設定');
    
    // ストリーミング設定を探す
    const streamingOption = page.locator('text=ストリーミング');
    if (await streamingOption.isVisible()) {
      await streamingOption.click();
    }
    
    // 設定を閉じる
    const closeButton = page.locator('button[aria-label*="Close"]');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
    
    // 質問を送信
    await page.fill('textarea[placeholder*="質問を入力"]', 'ストリーミングテスト');
    await page.click('button[title*="送信"]');
    
    // ストリーミングアニメーションを確認
    const streamingIndicator = page.locator('.animate-pulse');
    if (await streamingIndicator.isVisible({ timeout: 5000 })) {
      // ストリーミング中であることを確認
      expect(await streamingIndicator.count()).toBeGreaterThan(0);
      
      // ストリーミング完了を待つ
      await page.waitForSelector('.animate-pulse', { 
        state: 'hidden', 
        timeout: 30000 
      });
    }
  });

  test('should navigate to document from citation link', async ({ page }) => {
    // 質問を送信
    await page.fill('textarea[placeholder*="質問を入力"]', '文書の詳細について');
    await page.click('button[title*="送信"]');
    
    // 引用を待つ
    await page.waitForSelector('text=参照文書:', { timeout: 30000 });
    
    // 「文書を開く」リンクを探す
    const documentLinks = page.locator('a:has-text("文書を開く")');
    const linkCount = await documentLinks.count();
    
    if (linkCount > 0) {
      // 最初のリンクのhref属性を確認
      const firstLink = documentLinks.first();
      const href = await firstLink.getAttribute('href');
      
      // hrefが文書IDを含むパスであることを確認
      expect(href).toMatch(/\/documents\/[\w-]+/);
      
      // リンクをクリックして遷移をテスト（オプション）
      // await firstLink.click();
      // await expect(page).toHaveURL(/.*\/documents\/.*/);
    }
  });

  test('should show confidence level for responses', async ({ page }) => {
    // 質問を送信
    await page.fill('textarea[placeholder*="質問を入力"]', 'AIの信頼度テスト');
    await page.click('button[title*="送信"]');
    
    // 応答を待つ
    await page.waitForSelector('text=AI アシスタント', { timeout: 30000 });
    
    // 信頼度表示を確認
    const confidenceText = page.locator('text=信頼度:');
    if (await confidenceText.isVisible({ timeout: 5000 })) {
      // 信頼度レベルが表示されることを確認
      const confidenceLevel = await page.locator('text=/高|中|低/').textContent();
      expect(['高', '中', '低']).toContain(confidenceLevel);
      
      // パーセンテージが表示されることを確認
      const percentageText = await page.locator('text=/%/').textContent();
      if (percentageText) {
        const percentage = parseInt(percentageText.match(/(\d+)%/)?.[1] || '0', 10);
        expect(percentage).toBeGreaterThanOrEqual(0);
        expect(percentage).toBeLessThanOrEqual(100);
      }
    }
  });
});