# Contribution Guidelines

Thank you for considering contributing to our project! To ensure a smooth workflow and maintain high standards of code quality, we’ve outlined the following guidelines. Please read them carefully before starting any contributions.

## 1. **Getting Started**

### Fork the Repository

1. Fork the repository to your own GitHub account by clicking the **Fork** button.
2. Clone the forked repository to your local machine:

   ```bash
   git clone https://github.com/your-username/allocate.git
   cd allocate
   ```

### Set Up the Project Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run tests to make sure everything is working correctly:

   ```bash
   npx nx run-many -t lint test -p util-hooks util-data-values util-formatting ui-components ui service
   ```

## 2. **Branching Strategy**

We follow the **Git Flow** branching model to keep development organized. Here’s the flow:

- **`main`**: Contains the production-ready code. Only release versions should be merged here.
- **`feature/*`**: All new features should be developed in their own branch starting with `feature/`. Example: `feature/add-login`.

### Steps for Branching:

1. Create a new branch for your work from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes in the new branch and ensure that they meet the coding standards.

## 3. **Coding Standards**

To maintain a clean codebase, please adhere to the following coding conventions:

### JavaScript/React

- **Code Style**: Follow the [JavaScript Style Guide](https://developer.mozilla.org/en-US/docs/MDN/Writing_guidelines/Writing_style_guide/Code_style_guide/JavaScript). Use ESLint to enforce style rules. Check for linting on every change.
- **Naming Conventions**: Use camelCase for variables and functions, PascalCase for React components.
- **Comments**: Write clear, concise comments where necessary. All functions and complex logic should be documented.

### Python

- **Code Style**: Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/) for Python coding standards.
- **Docstrings**: All functions should be documented with proper docstrings.

### Testing

- **Unit Tests**: Add unit tests for any new functionality using Jest (for JavaScript/React) or pytest (for Python).
- **Test Coverage**: Aim for at least 80% coverage for new features.

## 4. **Submitting a Pull Request**

When you’ve finished making changes:

1. Ensure your code is up-to-date with the latest `develop` branch:

   ```bash
   git fetch origin
   git checkout develop
   git pull
   ```

2. Rebase your feature branch:

   ```bash
   git checkout feature/your-feature-name
   git rebase main
   ```

3. Run all tests to ensure everything works as expected:

   ```bash
   npx nx run-many -t lint test -p util-hooks util-data-values util-formatting ui-components ui service
   ```

4. Push your branch to your forked repository:

   ```bash
   git push origin feature/your-feature-name
   ```

5. Open a Pull Request:
   - Go to your repository on GitHub.
   - Click the **New Pull Request** button.
   - Select `main` as the base branch and your `feature/your-feature-name` branch to merge.
   - Provide a descriptive title and detailed description of your changes.

### PR Requirements:

- Ensure that your code passes all CI checks (build, lint, and tests).
- Add relevant documentation for any new features.
- Reference any relevant issue(s) in the description.
- Add the appropriate labels to your PR (e.g., `bug`, `enhancement`, `documentation`).

## 5. **Code of Conduct**

We are committed to fostering a welcoming and inclusive environment for all contributors. By participating, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md), which includes:

- Be respectful and constructive in communication.
- Avoid harassment, discrimination, or offensive language.
- Welcome contributions from all individuals regardless of background.

## 6. **Reporting Issues**

If you encounter any issues or bugs, feel free to open an issue on GitHub. Before doing so, please:

1. Search for any existing issues to avoid duplicates.
2. If no issue exists, open a new one with a clear and concise description of the problem, steps to reproduce, and relevant details (e.g., screenshots, error logs).

## 7. **Feature Requests**

We welcome feature requests! To suggest a new feature:

1. Open an issue labeled as `enhancement`.
2. Clearly explain the feature and its potential benefits.
3. Engage in discussion with maintainers and other contributors to refine the idea.

## 8. **License**

By contributing to this project, you agree that your contributions will be licensed under the [MIT License](LICENSE).

---

By following these guidelines, we aim to create a positive and efficient collaboration experience for everyone involved. We appreciate your contributions and look forward to building great things together!
