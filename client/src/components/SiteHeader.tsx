import { GithubLogo } from "@phosphor-icons/react";
import { Logo } from "./Logo";
import { Button } from "./ui/Button";

const REPO_URL = "https://github.com/huseyn0w/fast-connect";

export function SiteHeader() {
  return (
    <header className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
      <Logo />
      <nav className="flex items-center gap-1">
        <a
          href="#how-it-works"
          className="hidden rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:text-white sm:block focus-ring"
        >
          How it works
        </a>
        <a href={REPO_URL} target="_blank" rel="noreferrer">
          <Button variant="ghost" size="sm">
            <GithubLogo size={18} weight="fill" />
            GitHub
          </Button>
        </a>
      </nav>
    </header>
  );
}
