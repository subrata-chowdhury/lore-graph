import crypto from 'crypto';


const publicKey = `-----BEGIN RSA PUBLIC KEY-----
MIIBCgKCAQEAoeIVaJahKikDUrFH0DYFu+mGHp1VX3xDRPQvvgPeYVKxxXzBVc+P
AaB9GSEUjo2wb/DfTHJhQjSpbvJM/4Qc+T8GurOhJw4hBGuXJv4tVjIZPz5GmyXj
jGnWY4nJyNDtoP3U+SuAJ94rm2go8luY8bnUZowiGEGG2ZGd9YDQfSElIFjhCUgP
IinmXH6ZuDWxg3eXERMp+bSv6TreYuctFxnx9x0YbBi/XI3G1F13LbmfCNII6DJC
u3IHQZ/43YjMQpZFptCc/ZjcHnltkWb2906sm/+KHpovxC0HH/15UDbKXSgkw1dE
DpYWKqG5v63XPjelrdUOkU6GrnrqshyuIQIDAQAB
-----END RSA PUBLIC KEY-----`;

export function encryptData(data: string) {
    const encryptedData = crypto.publicEncrypt(publicKey, Buffer.from(data)).toString('base64');
    return encryptedData;
}
