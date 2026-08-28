import { Buffer } from 'node:buffer'
import { brotliCompressSync, gzipSync } from 'node:zlib'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function compressedAssets() {
  return {
    name: 'compressed-assets',
    apply: 'build',
    generateBundle(_, bundle) {
      for (const asset of Object.values(bundle)) {
        if (!/\.(css|html|js|json|svg|txt)$/.test(asset.fileName)) {
          continue
        }

        const source = Buffer.from(asset.type === 'asset' ? asset.source : asset.code)
        this.emitFile({
          type: 'asset',
          fileName: `${asset.fileName}.gz`,
          source: gzipSync(source, { level: 9 }),
        })
        this.emitFile({
          type: 'asset',
          fileName: `${asset.fileName}.br`,
          source: brotliCompressSync(source),
        })
      }
    },
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    compressedAssets(),
  ],
})