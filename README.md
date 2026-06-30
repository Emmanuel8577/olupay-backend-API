# OluPay Backend API

OluPay is a high-performance, resilient financial transaction and digital payment processing engine designed to handle massive peak traffic (such as salary disbursement windows) with sub-second execution latency. The platform is architected using a robust combination of traditional relational storage for strict ledger compliance and decoupling serverless patterns for scale.

## 🏗️ System Architecture & Infrastructure Design

The infrastructure is explicitly divided into high-throughput micro-services and transaction layers built on Amazon Web Services (AWS):

* **Relational Storage Layer:** Powered by Amazon RDS PostgreSQL managing transactional ledger entities, locked inside a private subnet (`Public accessibility: No`) to ensure strict enterprise data security compliance.
* **NoSQL Performance Layer:** Powered by Amazon DynamoDB using a Single-Table Design optimized for key-value performance and rapid index-based account access patterns.
* **Asynchronous Message Queueing:** Uses an Amazon SQS buffer to decouple downstream notification services from core financial processes, utilizing a 180-second Visibility Timeout buffer to eliminate data loss.
* **Serverless Notification Worker:** Mapped to AWS Lambda 2 and Amazon SNS to dispatch near real-time payment email confirmation loops completely out-of-band.

---

## 🛠️ Technology Stack

* **Backend Runtime:** Node.js (v18.x+) / Express.js REST Framework
* **Primary Relational Database:** PostgreSQL (Amazon RDS)
* **High-Speed Core Datastore:** Amazon DynamoDB (Single-Table Mode)
* **Caching & Session Management:** Amazon ElastiCache (Redis)
* **Infrastructure & Event Queueing:** AWS Lambda, Amazon SQS, Amazon SNS, API Gateway

---

## 🗄️ Database Configurations & Access Patterns

### 1. Amazon DynamoDB Single-Table Schema Layout
To minimize round-trip database queries, the NoSQL layer maps multi-entity structures into a single table using generic string indexes:

* **AP1 (Get User Profile):** `GetItem` where `PK = USER#<UserId>` and `SK = PROFILE`
* **AP2 (Fetch User Transactions):** `Query` where `PK = USER#<UserId>` and `SK begins_with(TX#)`
* **AP3 (Global Transaction Resolution):** `Query` on Global Secondary Index (`GSI1`) where `GSI1_PK = TXREF#<TxRef>`

#### Item Format Specification
```json
{
  "PK": {"S": "USER#101"},
  "SK": {"S": "TX#9902"},
  "Amount": {"N": "450000"},
  "Status": {"S": "SUCCESS"},
  "GSI1_PK": {"S": "TXREF#REF-2026-XYZ"},
  "GSI1_SK": {"S": "2026-06-30"}
}
2. Relational Schema & Handshake
The private core relational instance handles standard row validation. Secure database handshakes are performed internally from execution runtimes within the secure VPC boundary using target connection strings:

Bash
psql -h olupay-core-db.curio0imwthq.us-east-1.rds.amazonaws.com -U postgres -d postgres
🚀 Getting Started Locally
Prerequisites
Node.js installed locally.

An active AWS CLI configuration with appropriate IAM programmatic credentials for DynamoDB/SQS execution lines.

Installation Steps
Clone the Repository:

Bash
git clone [https://github.com/Emmanuel8577/olupay-backend-API.git](https://github.com/Emmanuel8577/olupay-backend-API.git)
cd olupay-backend-API
Install Dependencies:

Bash
npm install
Set Up Environment Variables:
Create a .env file in your root folder and define your staging variables:

Code snippet
PORT=5000
DB_HOST=olupay-core-db.curio0imwthq.us-east-1.rds.amazonaws.com
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_NAME=postgres
AWS_REGION=us-east-1
DYNAMODB_TABLE=OluPay-Core-Table
SQS_QUEUE_URL=[https://sqs.us-east-1.amazonaws.com/your-account/OluPay-Queue](https://sqs.us-east-1.amazonaws.com/your-account/OluPay-Queue)
Boot the Local Runtime:

Bash
npm run dev
📊 Observability & Monitoring Metrics
The serverless framework enforces strict performance alerting using integrated Amazon CloudWatch metrics:

CloudWatch Engine Dashboards: Aggregate real-time telemetry datasets spanning RDS CPU performance, DynamoDB Request Latency lines, and SQS Queue backlogs.

CloudWatch Insights Log Inspection: Automated log tracking filters standard output buffers cleanly to isolate application runtime exceptions:

SQL
fields @timestamp, @message, @duration, @maxMemoryUsed
| filter @message like /REPORT/ or @message like /ERROR/
| sort @timestamp desc
| limit 20
📄 License
This project is proprietary and maintained under internal technical development guidelines. Unauthorized duplication or deployment is strictly restricted.


---

### ⏱️ Deadline Checklist
1. Create a file exactly named `README.md` in your project folder.
2. Paste the text above inside.
3. Commit and push it straight up to GitHub:
   ```bash
   git add README.md
   git commit -m "docs: add comprehensive production architecture documentation"
   git push origin main
