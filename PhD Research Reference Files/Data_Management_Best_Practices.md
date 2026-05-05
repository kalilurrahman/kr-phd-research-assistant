# Data Management Best Practices for PhD Research

## Overview

Rigorous data management ensures data integrity, security, and accessibility throughout your research lifecycle. This guide provides practical implementation steps for each data management practice.

## 1. Data Organization

### Naming Conventions

Use consistent, meaningful file names that enable easy sorting and retrieval.

**Recommended Format**: `YYYY-MM-DD_ProjectCode_Description_VersionNumber`

**Examples**:
- `2025-01-15_MyProject_RawData_v1.xlsx`
- `2025-01-20_MyProject_CodedInterviews_v2.xlsx`
- `2025-02-10_MyProject_AnalysisScript_v3.R`

**Benefits**:
- Date sorting puts files in chronological order
- Consistent structure aids discoverability
- Version numbering prevents confusion
- Avoids unhelpful names like "Final_FINAL_v3"

### Folder Structure

Create a logical, consistent hierarchy that mirrors your research workflow.

**Standard Structure**:
```
ProjectName/
├── 01_Planning/
│   ├── Protocol/
│   ├── IRB/
│   └── Literature/
├── 02_Data/
│   ├── Raw_Data/
│   ├── Processed_Data/
│   ├── Metadata/
│   └── Data_Dictionary/
├── 03_Analysis/
│   ├── Scripts/
│   ├── Code/
│   └── Results/
├── 04_Writing/
│   ├── Manuscript/
│   ├── Figures/
│   └── Tables/
├── 05_Documentation/
│   ├── Lab_Notebook/
│   ├── Decision_Log/
│   └── README.md
└── Archive/
```

### README Files

Create README.md files in each folder describing contents and structure.

**Template for README.md**:
```markdown
# Project Name - [Folder Name]

## Description
Brief description of folder contents and purpose.

## Contents
- File1.xlsx: Description
- File2.R: Description
- Subfolder: Description

## How to Use
Steps for accessing or using these files.

## Data Dictionary
Link to data dictionary or variable descriptions.

## Notes
- Important considerations
- Data processing notes
- Known issues
```

## 2. Data Storage & Backup

### The 3-2-1 Backup Rule

Maintain 3 copies of data, on 2 different media types, with 1 copy offsite.

**Implementation**:

1. **Primary Working Copy** (Local machine)
   - Your computer's hard drive
   - Used daily for work
   - Most accessible
   - Vulnerable to hardware failure

2. **Automated Cloud Backup** (Different media type)
   - Google Drive / OneDrive / Dropbox
   - Set to automatic sync
   - Accessible from anywhere
   - Provides version history

3. **External Hard Drive Backup** (Different media type + offsite)
   - External portable drive
   - Store in secure location (home, office)
   - Monthly manual backup
   - True offsite backup for safety

### Testing Your Backup

**Critical**: Never assume backups work without testing.

1. Attempt to restore a file from each backup location
2. Verify file integrity
3. Document backup verification in lab notebook
4. Test restoration quarterly

### Cloud Storage Selection

| Feature | Google Drive | OneDrive | Dropbox |
|---------|-------------|----------|---------|
| **Free Storage** | 15 GB | 5 GB | 2 GB |
| **Version History** | 30 days | 93 days | 30 days |
| **Collaboration** | Excellent | Good | Good |
| **Integration** | Google Workspace | Microsoft 365 | Extensive |
| **Security** | Strong | Strong | Strong |
| **Best For** | Academic; Collaboration | Microsoft users | Mixed workflows |

## 3. Data Security

### Encryption

Protect sensitive data through encryption.

**At Rest** (stored data):
- Enable full-disk encryption (BitLocker, FileVault, LUKS)
- Encrypt external drives (BitLocker, Veracrypt)
- Use encrypted containers for sensitive files

**In Transit** (moving data):
- Use VPN for public Wi-Fi
- Use HTTPS for file transfers
- Avoid USB drives without encryption

### Access Control

Limit data access to authorized research team members.

**Implementation**:
1. Use strong passwords (minimum 16 characters)
2. Enable two-factor authentication for cloud accounts
3. Create file permissions: read-only for observers, edit for team
4. Maintain access log documenting who accessed what/when
5. Remove access when team members leave

### De-identification

Remove or obscure identifiable information from data.

**Process**:
1. Identify all potentially identifiable variables (name, ID, dates, phone, email, address)
2. Create mapping document (kept separately): Original ID → Code
3. Remove identified variables from analysis dataset
4. Replace with codes or pseudonyms
5. Store mapping document separately with limited access

**Example**:
```
Original: Name=John Smith, DOB=1990-05-15, Phone=555-1234
De-identified: ID=001, YearOfBirth=1990, Region=Midwest
```

## 4. Data Documentation

### Data Dictionary

Document all variables, their definitions, and coding schemes.

**Template**:
| Variable Name | Description | Data Type | Units | Values/Coding | Source |
|---------------|-------------|-----------|-------|---------------|--------|
| participant_id | Unique participant identifier | Integer | - | 001-150 | Assigned at enrollment |
| age_at_entry | Age of participant at study entry | Integer | Years | 18-89 | Birth date calculated |
| income_level | Reported annual household income | Categorical | - | 1=<$25k, 2=$25-50k, 3=>$50k | Survey Q12 |

### Codebook

Document coding schemes for categorical variables.

**Template**:
```
Variable: gender
Question (if applicable): What is your gender?
Data Type: Categorical
Coding:
  1 = Male / Man
  2 = Female / Woman
  3 = Non-binary
  4 = Prefer to self-describe: ___________
  99 = Missing/Not stated

Notes: Include any decisions about coding or handling of responses
```

### Metadata

Document information about the dataset itself.

**Template**:
```
Dataset: [Dataset Name]
Collection Period: [Dates]
Sample Size: N = [number]
Data Collection Method: [description]
Geographic Location: [location]
Language: [language(s)]
IRB Approval: [IRB-XXXX]
Data Collector: [person]
Contact: [email]
Citation: [how to cite this dataset]
```

## 5. Version Control for Data

Use version control systems to track changes to code and documents.

### Git Setup for Research

**Installation**:
```bash
# Install Git
# macOS: brew install git
# Linux: sudo apt-get install git
# Windows: Download from git-scm.com

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@university.edu"

# Create repository
cd /path/to/project
git init
```

### Typical Workflow

```bash
# See what changed
git status

# Stage changes
git add filename.R
# or stage all changes
git add .

# Commit with meaningful message
git commit -m "Added sensitivity analysis for Model 2"

# View history
git log

# Create backup on remote (GitHub, GitLab)
git push origin main
```

### Good Commit Messages

**Bad**: "Updates", "Fixed stuff", "Final"

**Good**: 
- "Added age-stratified analysis per reviewer comments"
- "Fixed missing data imputation in income variable"
- "Updated demographics table formatting for journal submission"

## 6. Data Analysis

### Reproducible Workflows

Make your analysis reproducible so anyone (including future-you) can understand and rerun it.

**Principles**:
1. **Document everything**: Every decision has a reason
2. **Comment code**: Explain what and why, not just what
3. **Use relative paths**: Allow code to work on any computer
4. **Version your data**: Keep raw data immutable
5. **Log your session**: Record R/Python/Stata versions and packages

### Script Organization

**Template structure**:
```r
# ============================================
# Analysis of [Study Topic]
# Date: 2025-02-15
# Author: Your Name
# Project: [Project Name]
# ============================================

# Description:
# This script performs [describe analysis]

# Load packages
library(tidyverse)
library(rstatix)

# Load and prepare data
raw_data <- read.csv("../02_Data/raw_data.csv")

# Clean data
clean_data <- raw_data %>%
  filter(!is.na(outcome)) %>%
  mutate(age_group = cut(age, breaks = c(0, 30, 65, 100)))

# Analysis 1: Descriptive statistics
descriptive <- clean_data %>%
  summarize(mean_age = mean(age),
            sd_age = sd(age),
            n = n())

# Analysis 2: Primary analysis
model1 <- lm(outcome ~ predictor + age + gender, data = clean_data)
summary(model1)

# Save results
write.csv(descriptive, "../03_Analysis/Results/descriptive_statistics.csv")
```

## 7. Data Sharing

### Open Science Principles

Share data to maximize impact and enable reproducibility.

**Where to Share**:
- **Zenodo**: Multidisciplinary; good for datasets
- **Figshare**: Multimedia; good for figures and data
- **OSF**: Open Science Framework; project management + sharing
- **Discipline-specific**: PDB (proteins), GenBank (sequences), etc.
- **Institutional repository**: University archival

### Preparation Steps

1. **Clean and process**: Remove erroneous data, outliers
2. **De-identify**: Ensure no identifiable information
3. **Document thoroughly**: Data dictionary, codebook, README
4. **Create DOI**: Get permanent, citable identifier
5. **Add license**: Specify how others can use (CC-BY, etc.)
6. **Version**: Tag releases clearly

### Licensing

Choose appropriate license for your data:
- **CC-BY**: Allow all uses with attribution (most open)
- **CC-BY-SA**: Allow uses with attribution + share-alike
- **CC-BY-NC**: Allow non-commercial uses with attribution
- **All rights reserved**: No reuse without permission (least open)

## 8. Creating a Data Management Plan (DMP)

Many funders require a formal Data Management Plan.

**Standard sections**:
1. Data types and volume
2. Data and metadata standards
3. Data collection and capture
4. Data processing and analysis
5. Data integrity and security
6. Data retention and archiving
7. Data sharing and access

**Template**:
```
Data Management Plan for [Project Name]

1. TYPES AND VOLUME OF DATA
Describe data types (surveys, interviews, lab measurements, etc.)
Estimated volume: [e.g., 500 GB]
Growth rate: [e.g., 50 GB/month]

2. STANDARDS
Data format: [e.g., CSV, HDF5, XML]
Metadata standards: [e.g., Dublin Core, discipline-specific]
Documentation standards: [data dictionary, README, etc.]

3. COLLECTION
Method: [survey, interview, sensor, etc.]
Instrument: [description]
Quality control: [validation checks, etc.]

4. PROCESSING
Data cleaning procedures: [description]
Analysis approach: [statistical or qualitative]
Software versions: [R 4.1.0, Python 3.9, etc.]

5. SECURITY
Access controls: [password, encryption, etc.]
De-identification process: [coding scheme]
Backup: [3-2-1 rule implementation]

6. RETENTION
Retention period: [7 years, 10 years, etc.]
Archive location: [institutional repository, etc.]
Destruction plan: [how and when data will be destroyed]

7. SHARING & ACCESS
Sharing timeline: [when will data be shared]
Access conditions: [open; restricted; embargo]
Repository: [Zenodo; OSF; institutional; etc.]
Citation: [DOI; how to cite]
```

## Troubleshooting Common Issues

### "I've Lost Data!"
1. Check all three backup locations
2. Use recovery software (Recuva, PhotoRec) on deleted drives
3. Check cloud storage trash/recycle bin (30-90 day recovery window)
4. Contact IT if institutional drive

### "My Data is Disorganized"
1. Create structure now (better late than never)
2. Rename files systematically
3. Update README files
4. Organize into proper folders
5. Document what you did

### "I'm Not Sure What Data Is What"
1. Create comprehensive data dictionary immediately
2. Review codebook and notes
3. Use meaningful file names from now on
4. Document any ambiguities

## Resources

- **Dataone Best Practices Guide**: https://www.dataone.org/
- **UK Data Archive Guide**: https://www.data-archive.ac.uk/
- **MIT Data Management Best Practices**: https://libraries.mit.edu/data-management/
- **Zenodo Guides**: https://help.zenodo.org/
- **GitHub Desktop** (easier than command line): https://desktop.github.com/

---

**Remember**: Good data management practices pay dividends throughout your research. The time invested upfront saves time later and increases the impact of your work.
