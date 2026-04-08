"""
Deploy script for Moja Dieta PWA to VPS
Uses paramiko for SSH (Windows-friendly, no sshpass needed)
"""
import paramiko
import sys
import time

HOST = "84.247.162.185"
USER = "root"
PASS = "kxm_QKN6mtn*ktw_jfd"
REPO = "https://github.com/wpcoder23/moja-dieta.git"

def run(ssh, cmd, timeout=120):
    print(f"  $ {cmd}")
    stdin, stdout, stderr = ssh.exec_command(cmd, timeout=timeout)
    exit_code = stdout.channel.recv_exit_status()
    out = stdout.read().decode().strip()
    err = stderr.read().decode().strip()
    if out:
        # Print last 10 lines to keep output manageable
        lines = out.split('\n')
        if len(lines) > 10:
            print(f"  ... ({len(lines)-10} lines hidden)")
        for line in lines[-10:]:
            print(f"  {line}")
    if err and exit_code != 0:
        for line in err.split('\n')[-5:]:
            print(f"  ERR: {line}")
    if exit_code != 0:
        print(f"  EXIT: {exit_code}")
    return exit_code, out, err

def main():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print(f"Connecting to {HOST}...")
    ssh.connect(HOST, username=USER, password=PASS, timeout=10)
    print("Connected!\n")

    # Step 1: Install Node.js 22
    print("=== Step 1: Install Node.js 22 ===")
    rc, out, _ = run(ssh, "which node && node -v")
    if rc != 0 or "v22" not in out:
        print("Installing Node.js 22...")
        run(ssh, "curl -fsSL https://deb.nodesource.com/setup_22.x | bash -", timeout=60)
        run(ssh, "apt-get install -y nodejs", timeout=120)
        run(ssh, "node -v && npm -v")
    else:
        print("Node.js 22 already installed")

    # Step 2: Install PM2
    print("\n=== Step 2: Install PM2 ===")
    rc, _, _ = run(ssh, "which pm2")
    if rc != 0:
        run(ssh, "npm install -g pm2", timeout=60)
    run(ssh, "pm2 -v")

    # Step 3: Install git if missing
    print("\n=== Step 3: Check git ===")
    run(ssh, "which git && git --version")

    # Step 4: Clone/update repo
    print("\n=== Step 4: Clone repo ===")
    rc, _, _ = run(ssh, "test -d /opt/moja-dieta/app/.git && echo EXISTS")
    if rc == 0:
        print("Repo exists, pulling...")
        run(ssh, "cd /opt/moja-dieta/app && git pull")
    else:
        print("Cloning fresh...")
        run(ssh, "mkdir -p /opt/moja-dieta/data/uploads /opt/moja-dieta/backups")
        run(ssh, f"git clone {REPO} /opt/moja-dieta/app", timeout=60)

    # Step 5: Install deps & build
    print("\n=== Step 5: npm install & build ===")
    run(ssh, "cd /opt/moja-dieta/app && npm install", timeout=180)
    run(ssh, "cd /opt/moja-dieta/app && npm run build", timeout=180)

    # Step 6: Create .env
    print("\n=== Step 6: Create .env ===")
    run(ssh, """cat > /opt/moja-dieta/app/.env << 'ENVEOF'
DATABASE_PATH=/opt/moja-dieta/data/moja-dieta.sqlite
UPLOAD_PATH=/opt/moja-dieta/data/uploads
NODE_ENV=production
PORT=3100
ENVEOF""")

    # Step 7: Start with PM2
    print("\n=== Step 7: PM2 start ===")
    run(ssh, "pm2 delete moja-dieta 2>/dev/null; cd /opt/moja-dieta/app && PORT=3100 pm2 start npm --name moja-dieta -- start")
    run(ssh, "pm2 save")
    run(ssh, "pm2 startup 2>/dev/null || true")
    time.sleep(3)
    run(ssh, "pm2 list")

    # Step 8: Configure Caddy (already running on 80/443)
    print("\n=== Step 8: Configure Caddy ===")
    rc, out, _ = run(ssh, "cat /etc/caddy/Caddyfile 2>/dev/null || echo NO_CADDYFILE")
    print(f"Current Caddyfile:\n{out}\n")

    # Add moja-dieta.duckdns.org to Caddy
    # First check if it's already configured
    rc, _, _ = run(ssh, "grep -q 'moja-dieta.duckdns.org' /etc/caddy/Caddyfile 2>/dev/null && echo FOUND")
    if rc != 0:
        print("Adding moja-dieta.duckdns.org to Caddy...")
        run(ssh, """cat >> /etc/caddy/Caddyfile << 'CADDYEOF'

moja-dieta.duckdns.org {
    reverse_proxy localhost:3100
    encode gzip
}
CADDYEOF""")
        run(ssh, "caddy reload --config /etc/caddy/Caddyfile 2>/dev/null || systemctl reload caddy")
    else:
        print("Already configured in Caddy")

    # Step 9: Verify
    print("\n=== Step 9: Verify ===")
    time.sleep(2)
    run(ssh, "curl -s -o /dev/null -w '%{http_code}' http://localhost:3100")

    print("\n=== DONE ===")
    print("App should be live at: https://moja-dieta.duckdns.org")

    ssh.close()

if __name__ == "__main__":
    main()
