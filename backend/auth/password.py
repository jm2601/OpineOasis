from Cryptodome.Cipher import AES
from Cryptodome.Protocol.KDF import scrypt
from Cryptodome.Random import get_random_bytes

from datetime import datetime, timedelta
from base64 import b64encode, b64decode


def create_login_cookie(username: str, secret: bytes):
    """
    Create a cookie message that can be used to authenticate a user.
    :param username: The username of the logged-in user.
    :param secret: Bytes for a secret, read from the configuration file.
    :return: A string message that can be stored in a cookie.
    """

    expiration_date = datetime.now() + timedelta(days=7)
    message = username.encode("utf-8") + b"|" + expiration_date.isoformat().encode("utf-8")

    cipher = AES.new(secret, AES.MODE_EAX)
    nonce = cipher.nonce
    ciphertext, tag = cipher.encrypt_and_digest(message)

    return b64encode(nonce + tag + ciphertext).decode("utf-8")


def verify_login_cookie(cookie: str, secret: bytes) -> str or None:
    """
    Return the username if the cookie is valid, otherwise return None.
    :param cookie: A cookie stored on the client.
    :param secret: Bytes for a secret, read from the configuration file.
    :return: A string username, otherwise None.
    """

    if cookie is None or len(cookie) < 48:
        return None

    message = b64decode(cookie)
    nonce = message[:16]
    tag = message[16:32]
    ciphertext = message[32:]

    cipher = AES.new(secret, AES.MODE_EAX, nonce=nonce)

    try:
        decrypted_message = cipher.decrypt_and_verify(ciphertext, tag)
        text = decrypted_message.decode("utf-8")
        split_index = text.rindex("|")
        username, expiration_date = text[:split_index], text[split_index + 1:]
        expiration_date = datetime.fromisoformat(expiration_date)
        if expiration_date < datetime.now():
            return None
        return username
    except ValueError or UnicodeError:
        return None


def hash_password(password: str) -> (bytes, bytes):
    """
    Hash a password using scrypt.
    :param password: A password.
    :return: A tuple of the key and salt.
    """

    salt = get_random_bytes(16)
    key = scrypt(password, salt, 32, N=2 ** 16, r=8, p=1)
    return key, salt


def slow_compare(a: bytes, b: bytes) -> bool:
    """
    Compare two byte arrays in a way that takes a constant amount of time.
    :param a: A byte array.
    :param b: Another byte array.
    :return: Whether the two byte arrays are equal.
    """

    if len(a) != len(b):
        return False

    fail_count = 0
    for i in range(len(a)):
        if a[i] != b[i]:
            fail_count += 1

    return fail_count == 0


def verify_password(password: str, key: bytes, salt: bytes) -> bool:
    return slow_compare(key, scrypt(password, salt, 32, N=2 ** 16, r=8, p=1))

