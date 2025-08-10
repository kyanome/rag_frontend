/**
 * チャット設定コンポーネント
 */

import { FC } from 'react';
import { X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChatStore } from '@/stores/chat.store';

interface ChatSettingsProps {
  onClose: () => void;
}

export const ChatSettings: FC<ChatSettingsProps> = ({ onClose }) => {
  const { settings, updateSettings } = useChatStore();

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          チャット設定
        </h3>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* 設定項目 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 検索タイプ */}
        <div className="space-y-2">
          <Label htmlFor="search-type" className="text-xs">
            検索タイプ
          </Label>
          <Select
            value={settings.searchType}
            onValueChange={(value) => updateSettings({ searchType: value as 'keyword' | 'vector' | 'hybrid' })}
          >
            <SelectTrigger id="search-type" className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="keyword">キーワード検索</SelectItem>
              <SelectItem value="vector">ベクトル検索</SelectItem>
              <SelectItem value="hybrid">ハイブリッド検索</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 検索結果数 */}
        <div className="space-y-2">
          <Label htmlFor="max-results" className="text-xs">
            検索結果数
          </Label>
          <Select
            value={settings.maxResults.toString()}
            onValueChange={(value) => updateSettings({ maxResults: parseInt(value) })}
          >
            <SelectTrigger id="max-results" className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3件</SelectItem>
              <SelectItem value="5">5件</SelectItem>
              <SelectItem value="10">10件</SelectItem>
              <SelectItem value="15">15件</SelectItem>
              <SelectItem value="20">20件</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 生成温度 */}
        <div className="space-y-2">
          <Label htmlFor="temperature" className="text-xs flex items-center gap-1">
            生成温度
            <span className="group relative">
              <Info className="w-3 h-3 text-gray-400" />
              <span className="absolute hidden group-hover:block bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-900 text-white rounded whitespace-nowrap">
                高いほど創造的、低いほど正確
              </span>
            </span>
          </Label>
          <Select
            value={settings.temperature.toString()}
            onValueChange={(value) => updateSettings({ temperature: parseFloat(value) })}
          >
            <SelectTrigger id="temperature" className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0.0 (最も正確)</SelectItem>
              <SelectItem value="0.3">0.3 (正確)</SelectItem>
              <SelectItem value="0.5">0.5 (バランス)</SelectItem>
              <SelectItem value="0.7">0.7 (標準)</SelectItem>
              <SelectItem value="1.0">1.0 (創造的)</SelectItem>
              <SelectItem value="1.5">1.5 (より創造的)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 引用を含める */}
        <div className="space-y-2">
          <Label htmlFor="include-citations" className="text-xs">
            引用情報
          </Label>
          <Select
            value={settings.includeCitations ? 'true' : 'false'}
            onValueChange={(value) => updateSettings({ includeCitations: value === 'true' })}
          >
            <SelectTrigger id="include-citations" className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">表示する</SelectItem>
              <SelectItem value="false">表示しない</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ストリーミング */}
        <div className="space-y-2">
          <Label htmlFor="streaming" className="text-xs">
            応答方式
          </Label>
          <Select
            value={settings.useStreaming ? 'true' : 'false'}
            onValueChange={(value) => updateSettings({ useStreaming: value === 'true' })}
          >
            <SelectTrigger id="streaming" className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">ストリーミング（リアルタイム）</SelectItem>
              <SelectItem value="false">通常（一括）</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 説明 */}
      <div className="text-xs text-gray-500 dark:text-gray-400">
        <p>※ 設定は次の質問から適用されます</p>
      </div>
    </div>
  );
};