# Contributing to HR Management System

Thank you for considering contributing to our HR Management System!

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Maintain professional communication

## How to Contribute

### Reporting Bugs

When reporting bugs, please include:
- System version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Error logs

### Suggesting Features

- Check if feature already exists
- Provide detailed use case
- Explain why it's needed
- Consider Kenya-specific compliance requirements

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Follow coding standards
   - Add tests if applicable
   - Update documentation

4. **Commit your changes**
   ```bash
   git commit -m "feat: add feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**

## Coding Standards

### PHP (Backend)
- Follow PSR-12 coding standard
- Use meaningful variable names
- Add PHPDoc comments
- Sanitize all inputs
- Use prepared statements

### JavaScript/React (Frontend)
- Use ES6+ syntax
- Follow Airbnb style guide
- Use functional components with hooks
- Add prop-types validation
- Write meaningful component names

### Dart/Flutter (Mobile)
- Follow official Dart style guide
- Use meaningful widget names
- Add doc comments
- Handle errors gracefully

## Testing

- Write unit tests for new features
- Ensure all tests pass before submitting
- Test on multiple browsers (frontend)
- Test on both Android and iOS (mobile)

## Documentation

- Update README.md for new features
- Add API documentation for new endpoints
- Update INSTALLATION.md if setup changes
- Include code comments

## Commit Messages

Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `chore:` - Maintenance tasks

Example:
```
feat: add biometric attendance integration
fix: correct PAYE calculation for high earners
docs: update API documentation for leave endpoints
```

## Pull Request Process

1. Update documentation
2. Add tests if applicable
3. Ensure all tests pass
4. Update CHANGELOG.md
5. Request review from maintainers
6. Address review comments
7. Squash commits if requested

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## Questions?

Contact the development team at dev@yourcompany.com
