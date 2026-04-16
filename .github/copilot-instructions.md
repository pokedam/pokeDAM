# Copilot Custom Instructions

## Strict File Editing Rules
- **NEVER** use terminal commands (like `cat`, `echo`, `sed`, `awk`, etc.) to create, edit, or append to files.
- **ALWAYS** use the dedicated tool calls provided by the VS Code API (such as `replace_string_in_file` or `create_file`) to modify the codebase.
- File modifications must be done exclusively through the structured editing tools.