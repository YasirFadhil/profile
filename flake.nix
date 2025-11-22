{
  description = "Astro development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            npm-check-updates
            nodePackages.npm
            nodePackages.pnpm
            git
          ];

          shellHook = ''
            echo "🚀 Astro Development Environment Ready!"
            echo "Node.js version: $(node --version)"
            echo "npm version: $(npm --version)"
            echo ""
            echo "Quick commands:"
            echo "  npm create astro@latest my-site"
            echo "  npm run dev -- --host  (to access from phone)"
            echo ""
            export PATH="$PWD/node_modules/.bin:$PATH"
          '';
        };
      });
}
