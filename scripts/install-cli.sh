#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

REPO_OWNER="Alexbruvv"
REPO_NAME="livecomp"
CLI_NAME="livecomp"
INSTALL_DIR_BASE="$HOME/.local" # Or /usr/local for system-wide, but $HOME/.local is user-friendly
INSTALL_DIR="$INSTALL_DIR_BASE/bin"

# Helper functions
echo_info() {
  echo "[INFO] $1"
}

echo_error() {
  echo "[ERROR] $1" >&2
  exit 1
}

# Detect OS and architecture
get_os_arch() {
  OS_TYPE=$(uname -s | tr '[:upper:]' '[:lower:]')
  ARCH_TYPE=$(uname -m)

  case "$OS_TYPE" in
    linux)
      OS_NAME="linux"
      ;;
    darwin)
      OS_NAME="darwin"
      ;;
    *)
      echo_error "Unsupported OS: $OS_TYPE"
      ;;
  esac

  case "$ARCH_TYPE" in
    x86_64 | amd64)
      ARCH_NAME="x64"
      ;;
    arm64 | aarch64)
      ARCH_NAME="arm64"
      ;;
    *)
      echo_error "Unsupported architecture: $ARCH_TYPE"
      ;;
  esac

  echo "${OS_NAME}-${ARCH_NAME}"
}

# Installation logic
main() {
  OS_ARCH=$(get_os_arch)
  echo_info "Detected OS/Arch: $OS_ARCH"

  ASSET_FILENAME="${CLI_NAME}-${OS_ARCH}"
  DOWNLOAD_URL="https://github.com/$REPO_OWNER/$REPO_NAME/releases/latest/download/$ASSET_FILENAME"

  echo_info "Downloading $CLI_NAME from $DOWNLOAD_URL..."
  TEMP_DOWNLOAD_PATH="/tmp/$ASSET_FILENAME"
  curl -SL --progress-bar "$DOWNLOAD_URL" -o "$TEMP_DOWNLOAD_PATH" || echo_error "Download failed."

  echo_info "Making the binary executable..."
  chmod +x "$TEMP_DOWNLOAD_PATH"

  echo_info "Creating installation directory $INSTALL_DIR (if it doesn't exist)..."
  mkdir -p "$INSTALL_DIR"

  INSTALLED_CLI_PATH="$INSTALL_DIR/$CLI_NAME"
  echo_info "Moving $CLI_NAME to $INSTALLED_CLI_PATH..."
  mv "$TEMP_DOWNLOAD_PATH" "$INSTALLED_CLI_PATH" || echo_error "Failed to move binary."

  # Check if INSTALL_DIR is in PATH
  if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    echo_info ""
    echo_info "---------------------------------------------------------------------"
    echo_info "IMPORTANT: '$INSTALL_DIR' is not in your PATH."
    echo_info "Please add it to your shell configuration file (e.g., ~/.bashrc, ~/.zshrc):"
    echo_info ""
    echo_info "  export PATH=\"$INSTALL_DIR:\$PATH\""
    echo_info ""
    echo_info "Then, restart your terminal or source your shell config (e.g., 'source ~/.zshrc')."
    echo_info "---------------------------------------------------------------------"
  fi

  echo_info "$CLI_NAME installed successfully to $INSTALLED_CLI_PATH"
  echo_info "Try running: $CLI_NAME --version"
}

main "$@"
