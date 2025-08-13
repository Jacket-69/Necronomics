# **Necronomics Development Guidelines**

This document outlines the development standards and conventions used in the Necronomics project. It serves as a guide for maintaining code consistency and a clean, understandable version history.

## **Commit Message Guidelines**

To ensure a readable and structured version history, this project follows the [**Conventional Commits**](https://www.conventionalcommits.org/en/v1.0.0/) specification.  
Each commit message should follow this structure:  
\<type\>(\<scope\>): \<description\>

### **Type**

Must be one of the following:

* **feat**: A new feature for the user.  
* **fix**: A bug fix for the user.  
* **chore**: Routine tasks, build process, or updating dependencies.  
* **docs**: Changes to documentation (README.md, etc.).  
* **refactor**: A code change that neither fixes a bug nor adds a feature.  
* **style**: Code style changes (formatting, white-space, etc.).  
* **test**: Adding or correcting tests.  
* **perf**: A code change that improves performance.

### **Scope**

The scope should be the name of the module affected by the change. Examples:

* client  
* server  
* auth  
* db

### **Example**

feat(client): add transaction creation form

fix(server): correct password validation logic on registration  
chore(client): update react dependencies

## **Branching Strategy**

All new features or significant changes should be developed on a separate feature branch and then merged into main. This keeps the main branch stable.  
Branch names should be descriptive and follow this pattern:

* **features**: feature/name-of-feature (e.g., feature/user-login)  
* **fixes**: fix/name-of-bug (e.g., fix/dashboard-rendering-bug)