const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const pino = require('pino')

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState('./session')
  const sock = makeWASocket({ auth: state, logger: pino({level:'silent'}) })

  sock.ev.on('creds.update', saveCreds)

  // Pairing code terminal එකේ print වෙනවා first run එකේ
  sock.ev.on('connection.update', (u) => {
    if(u.qr) console.log('QR scan කරන්න, නැත්නම් pairing code බලන්න')
    if(u.connection === 'open') console.log('Bot online ✅')
  })

  sock.ev.on('messages.upsert', async ({messages}) => {
    const m = messages[0]
    if(!m.message || m.key.fromMe) return

    const text = m.message.conversation || ''
    const from = m.key.remoteJid

    if(text === '.test'){
      await sock.sendMessage(from, {text: '⚡ Mini Bot Working\nPower by Dilaksha dilshan📛'})
    }

    if(text.startsWith('.sticker')){
      const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage
      if(quoted?.imageMessage){
        // image to sticker - legal feature
        await sock.sendMessage(from, {sticker: {url: quoted.imageMessage}})
      }
    }
  })
}
start()
