
import * as path from 'path';
import * as fs from 'fs';
import * as archiver from 'archiver';
import express from 'express';

export function setupDownloadRoute(app: express.Express) {
  app.get('/api/download-project', (req, res) => {
    const projectRoot = path.resolve(__dirname, '..');
    const outputPath = path.join(projectRoot, 'project-download.zip');
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', () => {
      console.log(`Archive created: ${archive.pointer()} total bytes`);
      res.download(outputPath, 'vue-flow-coder.zip', (err) => {
        if (err) {
          console.error('Download error:', err);
        }
        // ลบไฟล์ zip หลังจากดาวน์โหลดเสร็จ
        fs.unlinkSync(outputPath);
      });
    });

    archive.on('error', (err) => {
      console.error('Archive error:', err);
      res.status(500).send('Error creating download archive');
    });

    archive.pipe(output);

    // เพิ่มไฟล์ทั้งหมดยกเว้น node_modules และไฟล์ที่ไม่ต้องการ
    archive.glob('**/*', {
      cwd: projectRoot,
      ignore: ['node_modules/**', '.git/**', 'project-download.zip']
    });

    archive.finalize();
  });
}
