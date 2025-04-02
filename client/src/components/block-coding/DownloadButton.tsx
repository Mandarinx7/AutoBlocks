
import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DownloadButton() {
  const handleDownload = async () => {
    try {
      window.location.href = '/api/download-project';
    } catch (error) {
      console.error('Download error:', error);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลด กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <Button onClick={handleDownload} variant="outline" size="sm">
      <Download className="h-4 w-4 mr-2" />
      ดาวน์โหลด Git
    </Button>
  );
}
