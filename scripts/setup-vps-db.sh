#!/bin/bash

# Quick setup script for PostgreSQL on VPS
# Run this on your VPS (not locally)

set -e

echo "🚀 Setting up PostgreSQL for Vouch..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root or with sudo"
    exit 1
fi

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "Cannot detect OS. Please install PostgreSQL manually."
    exit 1
fi

# Install PostgreSQL
echo "📦 Installing PostgreSQL..."
if [ "$OS" == "ubuntu" ] || [ "$OS" == "debian" ]; then
    apt update
    apt install -y postgresql postgresql-contrib
elif [ "$OS" == "centos" ] || [ "$OS" == "rhel" ]; then
    yum install -y postgresql-server postgresql-contrib
    postgresql-setup --initdb
    systemctl enable postgresql
    systemctl start postgresql
else
    echo "Unsupported OS. Please install PostgreSQL manually."
    exit 1
fi

# Start PostgreSQL
systemctl enable postgresql
systemctl start postgresql

# Get database name and user
read -p "Enter database name [vouch]: " DB_NAME
DB_NAME=${DB_NAME:-vouch}

read -p "Enter database user [vouch_user]: " DB_USER
DB_USER=${DB_USER:-vouch_user}

read -sp "Enter database password: " DB_PASS
echo ""

# Create database and user
echo "🔧 Creating database and user..."
sudo -u postgres psql <<EOF
CREATE DATABASE $DB_NAME;
CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;
\q
EOF

# Get VPS IP
VPS_IP=$(hostname -I | awk '{print $1}')

echo ""
echo "✅ PostgreSQL setup complete!"
echo ""
echo "📝 Add this to your .env file:"
echo "DATABASE_URL=\"postgresql://$DB_USER:$DB_PASS@$VPS_IP:5432/$DB_NAME?schema=public\""
echo ""
echo "🔒 Security recommendations:"
echo "1. Restrict PostgreSQL access with firewall rules"
echo "2. Consider using SSL for production"
echo "3. Keep your password secure"
echo ""
echo "Next steps:"
echo "1. Update your .env file with the DATABASE_URL above"
echo "2. Run: pnpm db:generate"
echo "3. Run: pnpm db:push"

