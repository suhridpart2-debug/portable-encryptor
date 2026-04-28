import os
import typer
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from pathlib import Path
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

app = typer.Typer(help="Portable Encryptor CLI - Secure your files locally.")
console = Console()

# Technical Constants (Matching Web Crypto API implementation)
ITERATIONS = 100000
SALT_SIZE = 16
IV_SIZE = 12

def derive_key(password: str, salt: bytes) -> bytes:
    """Derive a 256-bit AES key from a password using PBKDF2."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=ITERATIONS,
    )
    return kdf.derive(password.encode())

@app.command()
def encrypt(
    file_path: Path = typer.Argument(..., help="Path to the file to encrypt"),
    password: str = typer.Option(..., prompt=True, hide_input=True, help="Encryption password")
):
    """Encrypt a file using AES-256-GCM."""
    if not file_path.exists():
        console.print(f"[red]Error:[/red] File {file_path} not found.")
        raise typer.Exit(code=1)

    with Progress(
        SpinnerColumn(),
        TextColumn("[progress.description]{task.description}"),
        transient=True,
    ) as progress:
        progress.add_task(description="Encrypting file...", total=None)
        
        # 1. Generate Salt and IV
        salt = os.urandom(SALT_SIZE)
        iv = os.urandom(IV_SIZE)
        
        # 2. Derive Key
        key = derive_key(password, salt)
        
        # 3. Read File and Encrypt
        file_data = file_path.read_bytes()
        aesgcm = AESGCM(key)
        ciphertext = aesgcm.encrypt(iv, file_data, None)
        
        # 4. Save Encrypted File
        # Format: [SALT][IV][CIPHERTEXT + TAG]
        output_path = file_path.with_suffix(file_path.suffix + ".enc")
        with open(output_path, "wb") as f:
            f.write(salt)
            f.write(iv)
            f.write(ciphertext)

    console.print(f"\n[bold green]✓ Success![/bold green] File encrypted to: [cyan]{output_path}[/cyan]")
    console.print("[dim]Note: This file can be decrypted on the web app or using the 'decrypt' command.[/dim]")

@app.command()
def decrypt(
    file_path: Path = typer.Argument(..., help="Path to the .enc file to decrypt"),
    password: str = typer.Option(..., prompt=True, hide_input=True, help="Decryption password")
):
    """Decrypt an .enc file using AES-256-GCM."""
    if not file_path.exists():
        console.print(f"[red]Error:[/red] File {file_path} not found.")
        raise typer.Exit(code=1)

    try:
        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            transient=True,
        ) as progress:
            progress.add_task(description="Decrypting file...", total=None)
            
            # 1. Read Encrypted File
            data = file_path.read_bytes()
            
            if len(data) < SALT_SIZE + IV_SIZE:
                raise ValueError("Invalid encrypted file format.")
            
            # 2. Extract Components
            salt = data[:SALT_SIZE]
            iv = data[SALT_SIZE:SALT_SIZE+IV_SIZE]
            ciphertext = data[SALT_SIZE+IV_SIZE:]
            
            # 3. Derive Key
            key = derive_key(password, salt)
            
            # 4. Decrypt
            aesgcm = AESGCM(key)
            plaintext = aesgcm.decrypt(iv, ciphertext, None)
            
            # 5. Save Decrypted File
            output_path = file_path.with_name(file_path.name.replace(".enc", ""))
            if output_path == file_path:
                output_path = file_path.with_name("decrypted_" + file_path.name)
            
            output_path.write_bytes(plaintext)

        console.print(f"\n[bold green]✓ Success![/bold green] File decrypted to: [cyan]{output_path}[/cyan]")
    except Exception as e:
        console.print(f"\n[bold red]Error:[/bold red] Decryption failed. Incorrect password or corrupted file.")
        raise typer.Exit(code=1)

if __name__ == "__main__":
    app()
