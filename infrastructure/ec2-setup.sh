#!/bin/bash
# EC2 Instance Setup Script
# Run this script on your EC2 instance to prepare it for deployments

set -e

echo "=========================================="
echo "Freight Quote Backend - EC2 Setup"
echo "=========================================="

# Update system
echo "Updating system packages..."
sudo yum update -y

# Install Java 17
echo "Installing Java 17..."
sudo yum install -y java-17-amazon-corretto
java -version

# Install AWS CLI v2
echo "Installing AWS CLI..."
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
rm -rf awscliv2.zip aws/
aws --version

# Create application user
echo "Creating application user..."
sudo useradd -r -s /bin/false freight-quote || true

# Create application directories
echo "Creating application directories..."
sudo mkdir -p /opt/freight-quote
sudo mkdir -p /var/log/freight-quote

# Set permissions
sudo chown -R freight-quote:freight-quote /opt/freight-quote
sudo chown -R freight-quote:freight-quote /var/log/freight-quote

# Create placeholder environment file (deployment will replace this from S3)
echo "Creating placeholder environment configuration..."
sudo tee /opt/freight-quote/application.env > /dev/null <<EOF
# Managed via S3: this file will be replaced during deployment
# Expected object: s3://<DEPLOYMENT_BUCKET>/config/application.env
# Update the actual file in S3 instead of editing locally on the instance.
EOF

sudo chown freight-quote:freight-quote /opt/freight-quote/application.env
sudo chmod 600 /opt/freight-quote/application.env

# Create systemd service
echo "Creating systemd service..."
sudo tee /etc/systemd/system/freight-quote-backend.service > /dev/null <<'EOF'
[Unit]
Description=Freight Quote Backend Service
After=syslog.target network.target

[Service]
Type=simple
User=freight-quote
Group=freight-quote
WorkingDirectory=/opt/freight-quote

# Load environment variables from file
EnvironmentFile=/opt/freight-quote/application.env

# Start command (explicitly pass Spring profile as JVM property)
ExecStart=/bin/sh -c 'exec /usr/bin/java ${JAVA_OPTS} -Dspring.profiles.active=${SPRING_PROFILES_ACTIVE} -Dspring.datasource.url=${DB_URL} -Dspring.datasource.username=${DB_USERNAME} -Dspring.datasource.password=${DB_PASSWORD} -Dcors.allowed-origins=${CORS_ALLOWED_ORIGINS} -Dserver.port=${SERVER_PORT} -jar /opt/freight-quote/freight-quote-backend.jar'

# Restart policy
Restart=always
RestartSec=10

# Logging
StandardOutput=journal
StandardError=journal
SyslogIdentifier=freight-quote-backend

# Security
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
echo "Reloading systemd..."
sudo systemctl daemon-reload

# Enable service to start on boot
echo "Enabling service..."
sudo systemctl enable freight-quote-backend

# Create deployment script
echo "Creating deployment script..."
sudo tee /opt/freight-quote/deploy.sh > /dev/null <<'EOF'
#!/bin/bash
# Deployment script for Freight Quote Backend
# Usage: ./deploy.sh <BUCKET_NAME>

set -e
BUCKET_NAME=$1

if [ -z "$BUCKET_NAME" ]; then
    echo "Error: Bucket name argument is required."
    echo "Usage: $0 <BUCKET_NAME>"
    exit 1
fi

echo "[$(date)] Starting deployment..."

echo "Stopping existing application..."
sudo systemctl stop freight-quote-backend || true

echo "Downloading new JAR from S3 (Bucket: $BUCKET_NAME)..."
aws s3 cp "s3://${BUCKET_NAME}/backend/freight-quote-backend.jar" /opt/freight-quote/freight-quote-backend.jar

echo "Refreshing environment configuration from S3..."
aws s3 cp "s3://${BUCKET_NAME}/config/application.env" /opt/freight-quote/application.env

echo "Setting permissions..."
sudo chown freight-quote:freight-quote /opt/freight-quote/application.env
sudo chmod 600 /opt/freight-quote/application.env
sudo chown freight-quote:freight-quote /opt/freight-quote/freight-quote-backend.jar
sudo chmod 500 /opt/freight-quote/freight-quote-backend.jar

echo "Starting application..."
sudo systemctl start freight-quote-backend

echo "Waiting for application to start..."
sleep 15

echo "Checking application health..."
curl -f http://localhost:8080/actuator/health || exit 1

echo "[$(date)] Deployment successful!"
EOF

# Make deployment script executable
sudo chmod +x /opt/freight-quote/deploy.sh

echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Prepare environment configuration template (locally or on EC2):"
echo "   cat > ~/application.env.template <<'ENVEOF'"
echo "   # Spring Profile"
echo "   SPRING_PROFILES_ACTIVE=dev_or_prod"
echo ""
echo "   # Database Configuration"
echo "   DB_URL=jdbc:mysql://YOUR_RDS_ENDPOINT:3306/YOUR_DB_NAME"
echo "   DB_USERNAME=admin"
echo "   DB_PASSWORD=YOUR_DB_PASSWORD"
echo ""
echo "   # CORS Configuration"
echo "   CORS_ALLOWED_ORIGINS=http://localhost:3000,https://YOUR_CLOUDFRONT_DOMAIN"
echo ""
echo "   # Server Configuration"
echo "   SERVER_PORT=8080"
echo ""
echo "   # JVM Options"
echo "   JAVA_OPTS=-Xms512m -Xmx1024m -XX:+UseG1GC"
echo "   ENVEOF"
echo ""
echo "2. Edit the template with actual values:"
echo "   nano ~/application.env.template"
echo ""
echo "3. Upload the file to S3 (replace YOUR_DEPLOYMENT_BUCKET):"
echo "   aws s3 cp ~/application.env.template s3://YOUR_DEPLOYMENT_BUCKET/config/application.env"
echo ""
echo "4. The application will download application.env from S3 during each deployment"
echo ""
echo "5. Check service status:"
echo "   sudo systemctl status freight-quote-backend"
echo ""
echo "6. View logs:"
echo "   sudo journalctl -u freight-quote-backend -f"
echo ""
echo "7. Test health endpoint:"
echo "   curl http://localhost:8080/actuator/health"
echo ""
