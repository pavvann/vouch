#!/bin/bash

# Script to fix PostgreSQL remote connection issues
# Run this on your VPS

set -e

echo "🔧 Fixing PostgreSQL remote connection..."

# Detect PostgreSQL version and config location
if [ -d /etc/postgresql ]; then
    PG_VERSION=$(ls /etc/postgresql | head -n 1)
    PG_CONF="/etc/postgresql/$PG_VERSION/main/postgresql.conf"
    PG_HBA="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"
elif [ -f /var/lib/pgsql/data/postgresql.conf ]; then
    PG_CONF="/var/lib/pgsql/data/postgresql.conf"
    PG_HBA="/var/lib/pgsql/data/pg_hba.conf"
else
    echo "❌ Could not find PostgreSQL config files"
    echo "Please run this script on your VPS where PostgreSQL is installed"
    exit 1
fi

echo "📝 Found PostgreSQL config at: $PG_CONF"

# Backup configs
echo "💾 Backing up config files..."
sudo cp "$PG_CONF" "${PG_CONF}.backup.$(date +%Y%m%d_%H%M%S)"
sudo cp "$PG_HBA" "${PG_HBA}.backup.$(date +%Y%m%d_%H%M%S)"

# Configure postgresql.conf to listen on all interfaces
echo "🔧 Configuring PostgreSQL to listen on all interfaces..."
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"
sudo sed -i "s/listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"

# Add pg_hba.conf entry for remote connections
echo "🔧 Configuring authentication..."
if ! grep -q "host.*all.*all.*0.0.0.0/0.*md5" "$PG_HBA"; then
    echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a "$PG_HBA"
fi

# Restart PostgreSQL
echo "🔄 Restarting PostgreSQL..."
sudo systemctl restart postgresql

# Check if PostgreSQL is listening
echo "🔍 Checking if PostgreSQL is listening..."
sleep 2
if sudo netstat -tlnp | grep -q ":5432"; then
    echo "✅ PostgreSQL is listening on port 5432"
    sudo netstat -tlnp | grep ":5432"
else
    echo "⚠️  PostgreSQL might not be listening. Checking status..."
    sudo systemctl status postgresql
fi

echo ""
echo "✅ Configuration updated!"
echo ""
echo "🔒 Security Note: Make sure your firewall only allows connections from trusted IPs:"
echo "   sudo ufw allow from YOUR_APP_IP to any port 5432"
echo ""
echo "🧪 Test connection from your local machine:"
echo "   psql -h 188.245.53.188 -U vouch -d vouch"
