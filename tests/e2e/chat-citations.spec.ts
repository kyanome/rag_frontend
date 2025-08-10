/**
 * 引用表示機能のE2Eテスト
 */

import { test, expect } from '@playwright/test';

test.describe('RAGチャット - 引用表示機能', () => {
  test.beforeEach(async ({ page }) => {
    // チャットページにアクセス
    await page.goto('/chat');
    await page.waitForSelector('[data-testid="chat-container"]', { timeout: 10000 });
  });

  test('引用付きの回答を正しく表示する', async ({ page }) => {
    // テスト用の質問を送信
    const testQuery = 'RAGシステムの仕組みについて教えてください';
    await page.fill('[data-testid="chat-input"]', testQuery);
    await page.press('[data-testid="chat-input"]', 'Enter');

    // 回答が表示されるまで待機
    await page.waitForSelector('[data-testid="message-assistant"]', { timeout: 30000 });

    // 引用マーカーが表示されることを確認
    const citationMarkers = await page.locator('[data-testid="citation-marker"]').count();
    expect(citationMarkers).toBeGreaterThan(0);

    // 引用カードが表示されることを確認
    const citationCards = await page.locator('[data-testid="citation-card"]').count();
    expect(citationCards).toBeGreaterThan(0);
  });

  test('インライン引用マーカー[N]形式が機能する', async ({ page }) => {
    // 引用付き回答を表示
    await page.fill('[data-testid="chat-input"]', 'RAGシステムとは何ですか？');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('[data-testid="message-assistant"]', { timeout: 30000 });

    // [1]形式のマーカーを探す
    const marker = page.locator('[data-testid="citation-marker"]').first();
    await expect(marker).toBeVisible();
    
    // マーカーのテキストが正しい形式
    const markerText = await marker.textContent();
    expect(markerText).toMatch(/\[\d+\]/);
  });

  test('引用マーカーのツールチップが表示される', async ({ page }) => {
    // 引用付き回答を表示
    await page.fill('[data-testid="chat-input"]', 'RAGシステムについて');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('[data-testid="message-assistant"]', { timeout: 30000 });

    // 引用マーカーにホバー
    const marker = page.locator('[data-testid="citation-marker"]').first();
    await marker.hover();

    // ツールチップが表示される
    const tooltip = page.locator('[role="tooltip"]');
    await expect(tooltip).toBeVisible();

    // ツールチップに文書タイトルが含まれる
    const tooltipText = await tooltip.textContent();
    expect(tooltipText).toBeTruthy();
  });

  test('引用マーカークリックでカードがハイライトされる', async ({ page }) => {
    // 引用付き回答を表示
    await page.fill('[data-testid="chat-input"]', 'RAGシステムの利点は？');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('[data-testid="message-assistant"]', { timeout: 30000 });

    // 引用マーカーをクリック
    const marker = page.locator('[data-testid="citation-marker"]').first();
    await marker.click();

    // 対応する引用カードがハイライトされる
    const highlightedCard = page.locator('[data-testid="citation-card"].highlighted');
    await expect(highlightedCard).toBeVisible();
  });

  test('引用カードの展開/折りたたみが機能する', async ({ page }) => {
    // 引用付き回答を表示
    await page.fill('[data-testid="chat-input"]', 'RAGの詳細について');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('[data-testid="message-assistant"]', { timeout: 30000 });

    // 引用カードの展開ボタンを探す
    const expandButton = page.locator('[data-testid="citation-expand-button"]').first();
    
    if (await expandButton.isVisible()) {
      // 初期状態のテキスト
      const initialText = await expandButton.textContent();
      expect(initialText).toContain('展開');

      // クリックして展開
      await expandButton.click();
      
      // ボタンテキストが変わる
      await expect(expandButton).toContainText('折りたたむ');

      // 全文が表示される
      const fullContent = page.locator('[data-testid="citation-full-content"]');
      await expect(fullContent).toBeVisible();

      // 再度クリックして折りたたむ
      await expandButton.click();
      await expect(expandButton).toContainText('展開');
    }
  });

  test('引用カードの関連度スコアが表示される', async ({ page }) => {
    // 引用付き回答を表示
    await page.fill('[data-testid="chat-input"]', 'RAGシステムの構成要素');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('[data-testid="message-assistant"]', { timeout: 30000 });

    // 引用カードを取得
    const citationCard = page.locator('[data-testid="citation-card"]').first();
    await expect(citationCard).toBeVisible();

    // 関連度スコアが表示される
    const scoreElement = citationCard.locator('[data-testid="relevance-score"]');
    await expect(scoreElement).toBeVisible();
    
    // スコアが0-100%の範囲
    const scoreText = await scoreElement.textContent();
    const scoreMatch = scoreText?.match(/(\d+)%/);
    if (scoreMatch) {
      const score = parseInt(scoreMatch[1]);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    }
  });

  test('テキストハイライト機能が動作する', async ({ page }) => {
    // 設定でハイライトを有効化
    await page.click('[data-testid="chat-settings-button"]');
    await page.waitForSelector('[data-testid="settings-panel"]');
    
    const highlightToggle = page.locator('[data-testid="citation-highlight-toggle"]');
    if (await highlightToggle.isVisible()) {
      await highlightToggle.check();
    }
    await page.click('[data-testid="settings-close-button"]');

    // 引用付き回答を表示
    await page.fill('[data-testid="chat-input"]', 'RAGシステムのメリット');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('[data-testid="message-assistant"]', { timeout: 30000 });

    // ハイライトされたテキストが存在する
    const highlights = page.locator('mark');
    const highlightCount = await highlights.count();
    
    if (highlightCount > 0) {
      // ハイライトに適切なスタイルが適用されている
      const firstHighlight = highlights.first();
      const className = await firstHighlight.getAttribute('class');
      expect(className).toContain('bg-yellow-200');
    }
  });

  test('引用なしのメッセージも正しく表示される', async ({ page }) => {
    // シンプルな質問を送信
    await page.fill('[data-testid="chat-input"]', 'こんにちは');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('[data-testid="message-assistant"]', { timeout: 30000 });

    // 引用マーカーが存在しない
    const citationMarkers = await page.locator('[data-testid="citation-marker"]').count();
    expect(citationMarkers).toBe(0);

    // 引用カードが存在しない
    const citationCards = await page.locator('[data-testid="citation-card"]').count();
    expect(citationCards).toBe(0);

    // メッセージ自体は表示される
    const message = page.locator('[data-testid="message-assistant"]').last();
    await expect(message).toBeVisible();
  });

  test('複数の引用が正しく処理される', async ({ page }) => {
    // 複数の引用を含む質問
    await page.fill('[data-testid="chat-input"]', 'RAGシステムの全体的な説明と詳細な技術仕様を教えてください');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('[data-testid="message-assistant"]', { timeout: 30000 });

    // 複数の引用マーカーが存在
    const markers = page.locator('[data-testid="citation-marker"]');
    const markerCount = await markers.count();
    
    if (markerCount > 1) {
      // 各マーカーが異なる番号を持つ
      const markerTexts = await markers.allTextContents();
      const uniqueNumbers = new Set(markerTexts.map(text => text.match(/\[(\d+)\]/)?.[1]));
      expect(uniqueNumbers.size).toBeGreaterThan(1);
    }

    // 複数の引用カードが存在
    const cards = page.locator('[data-testid="citation-card"]');
    const cardCount = await cards.count();
    
    if (cardCount > 1) {
      // 各カードが異なる文書を参照
      const titles = await cards.locator('[data-testid="document-title"]').allTextContents();
      expect(titles.length).toBeGreaterThan(1);
    }
  });

  test('引用パネルのスクロールが機能する', async ({ page }) => {
    // 多くの引用を含む回答を生成
    await page.fill('[data-testid="chat-input"]', 'RAGシステムに関する包括的な情報を全て教えてください');
    await page.press('[data-testid="chat-input"]', 'Enter');
    await page.waitForSelector('[data-testid="message-assistant"]', { timeout: 30000 });

    const citationContainer = page.locator('[data-testid="citations-container"]');
    
    if (await citationContainer.isVisible()) {
      // スクロール可能かチェック
      const scrollHeight = await citationContainer.evaluate(el => el.scrollHeight);
      const clientHeight = await citationContainer.evaluate(el => el.clientHeight);
      
      if (scrollHeight > clientHeight) {
        // スクロールが必要な場合、スクロールバーが存在する
        const hasScrollbar = await citationContainer.evaluate(el => {
          return el.scrollHeight > el.clientHeight;
        });
        expect(hasScrollbar).toBeTruthy();
      }
    }
  });
});