import {
  Component,
  Input,
  HostListener,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  signal,
  ElementRef,
  Signal,
  effect,
  viewChild,
} from '@angular/core';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type DialogueStep =
  | string
  | { type: 'text'; value: string; speed?: number }
  | { type: 'pause'; duration: number }
  | { type: 'jump' }
  | { type: 'action'; ignoreOnFlush?: boolean; action: () => void };

export type DialogueSequence = DialogueStep[];

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

/** A pause marker within a page's character stream. */
interface PauseMarker {
  charIndex: number;
  duration: number;
}

/** An action marker within a page's character stream. */
interface ActionMarker {
  charIndex: number;
  action: () => void;
  ignoreOnFlush: boolean;
}

/** A speed-change marker within a page's character stream. */
interface SpeedMarker {
  charIndex: number;
  speed: number;       // ms per character
}

/** A renderable page with optional inline pauses and speed changes. */
interface Page {
  content: string;
  pauses: PauseMarker[];
  speeds: SpeedMarker[];
  actions: ActionMarker[];
}

const DEFAULT_SPEED = 40;

/** An atom produced while linearising the sequence. */
type Atom =
  | { kind: 'word'; text: string; width: number; speed?: number }
  | { kind: 'pause'; duration: number }
  | { kind: 'action'; ignoreOnFlush: boolean; action: () => void };

/** A word placed on a line, remembering its atom index. */
interface PlacedWord {
  text: string;
  atomIndex: number;
}

type Line = string[];

@Component({
  selector: 'app-dialogue',
  standalone: true,
  templateUrl: './dialogue.html',
  styleUrl: './dialogue.css',
})
export class Dialogue implements OnDestroy {

  @Input() sequence!: Signal<DialogueSequence>;

  measureContainer = viewChild<ElementRef<HTMLParagraphElement>>('measureContainer');

  displayedText = signal<string>('');
  isPageComplete = signal<boolean>(false);
  hasMorePages = signal<boolean>(false);

  private typingInterval: any;
  private pauseTimeout: any;

  private pageString: string = '';
  private pages: Page[] = [];
  private currentPageIndex: number = 0;
  private currentCharIndex: number = 0;
  private currentPauseIdx: number = 0;
  private currentSpeedIdx: number = 0;
  private currentActionIdx: number = 0;
  private currentSpeed: number = DEFAULT_SPEED;

  // ngOnChanges(changes: SimpleChanges) {
  //   if (changes['sequence'] && this.sequence.length > 0) {
  //     setTimeout(() => this.buildAndStart(), 0);
  //   } else if (changes['text'] && this.text) {
  //     setTimeout(() => this.buildAndStart(), 0);
  //   }
  // }
  private isFlushing = false;

  constructor() {
    effect(() => {
      const seq = this.sequence();
      if (this.isFlushing) {
        for (const step of seq)
          if (typeof step === 'object' && step.type === 'action' && !step.ignoreOnFlush)
            queueMicrotask(() => step.action());

        return;
      }
      console.log("Received sequence", seq);
      this.isFlushing = true;

      const curr = this.pages[this.currentPageIndex];
      if (curr)
        for (const action of curr.actions.slice(this.currentActionIdx))
          if (!action.ignoreOnFlush)
            queueMicrotask(() => action.action());

      for (const step of this.pages.slice(this.currentPageIndex + 1))
        for (const action of step.actions)
          if (!action.ignoreOnFlush)
            queueMicrotask(() => action.action());
      this.isFlushing = false;
      this.buildAndStart(seq);

    });
  }

  ngOnDestroy() {
    this.stopAll();
  }

  // ---------------------------------------------------------------------------
  // Normalise input
  // ---------------------------------------------------------------------------

  /** Normalise a single step: raw strings become text objects. */
  private normaliseStep(step: DialogueStep): Exclude<DialogueStep, string> {
    return typeof step === 'string' ? { type: 'text', value: step } : step;
  }

  private normaliseSequence(sequence: DialogueSequence): Exclude<DialogueStep, string>[] {
    if (sequence.length > 0) return sequence.map(s => this.normaliseStep(s));
    //if (this.text) return [{ type: 'text', value: this.text }];
    return [];
  }

  // ---------------------------------------------------------------------------
  // Build pages from the sequence
  // ---------------------------------------------------------------------------

  buildAndStart(sequence: DialogueSequence) {
    const el = this.measureContainer()?.nativeElement;
    if (!el) return;

    const seq = this.normaliseSequence(sequence);
    if (seq.length === 0) return;

    // --- Text-measurement setup -------------------------------------------
    const computedStyle = getComputedStyle(el);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    ctx.font = computedStyle.font;

    const spaceWidth = ctx.measureText(' ').width;
    const lineWidth = el.clientWidth;

    const fontSize = parseFloat(computedStyle.fontSize);
    const lhValue = parseFloat(computedStyle.lineHeight);
    const lineHeight = isNaN(lhValue) ? fontSize * 1.2 : lhValue;

    const dialogueBox = el.parentElement!;
    const paddingTop = parseFloat(getComputedStyle(dialogueBox).paddingTop);
    const paddingBottom = parseFloat(getComputedStyle(dialogueBox).paddingBottom);
    const boxContentHeight = dialogueBox.clientHeight - paddingTop - paddingBottom;
    const linesPerPage = Math.max(1, Math.floor(boxContentHeight / lineHeight));

    // --- Split sequence into sections (separated by jumps) ----------------
    type NormStep = Exclude<DialogueStep, string>;
    const sections: NormStep[][] = [];
    let curSection: NormStep[] = [];
    for (const step of seq) {
      if (step.type === 'jump') {
        sections.push(curSection);
        curSection = [];
      } else {
        curSection.push(step);
      }
    }
    if (curSection.length > 0) sections.push(curSection);

    // --- Process each section into pages ----------------------------------
    this.pages = [];

    for (const section of sections) {
      // Build atoms
      const atoms: Atom[] = [];
      for (const step of section) {
        if (step.type === 'text') {
          const speed = step.speed;
          for (const w of step.value.split(' ').filter(Boolean)) {
            atoms.push({ kind: 'word', text: w, width: ctx.measureText(w).width, speed });
          }
        } else if (step.type === 'pause') {
          atoms.push({ kind: 'pause', duration: step.duration });
        } else if (step.type === 'action') {
          atoms.push({ kind: 'action', ignoreOnFlush: step.ignoreOnFlush ?? false, action: step.action });
        }
      }

      // Word-wrap (only words), tracking atom indices
      const lines: PlacedWord[][] = [];
      let curLine: PlacedWord[] = [];
      let curLineWidth = 0;

      for (let i = 0; i < atoms.length; i++) {
        const atom = atoms[i];
        if (atom.kind !== 'word') continue;

        if (curLine.length === 0) {
          curLine.push({ text: atom.text, atomIndex: i });
          curLineWidth = atom.width;
        } else {
          const needed = curLineWidth + spaceWidth + atom.width;
          if (needed > lineWidth) {
            lines.push(curLine);
            curLine = [{ text: atom.text, atomIndex: i }];
            curLineWidth = atom.width;
          } else {
            curLine.push({ text: atom.text, atomIndex: i });
            curLineWidth = needed;
          }
        }
      }
      if (curLine.length > 0) lines.push(curLine);

      // Group lines into pages and compute pause + speed markers
      for (let l = 0; l < lines.length; l += linesPerPage) {
        const pageLines = lines.slice(l, l + linesPerPage);
        const content = pageLines.map(pl => pl.map(e => e.text).join(' ')).join('\n');

        const pauseMarkers: PauseMarker[] = [];
        const speedMarkers: SpeedMarker[] = [];
        const actionMarkers: ActionMarker[] = [];
        let charPos = 0;
        let lastSpeed: number | undefined;

        // Collect actions and pauses before the very first word of the section
        if (l === 0) {
          const firstWordIdx = pageLines.length > 0 && pageLines[0].length > 0 ? pageLines[0][0].atomIndex : atoms.length;
          for (let a = 0; a < firstWordIdx; a++) {
            const atom = atoms[a];
            if (atom.kind === 'pause') pauseMarkers.push({ charIndex: 0, duration: atom.duration });
            else if (atom.kind === 'action') actionMarkers.push({ charIndex: 0, ignoreOnFlush: atom.ignoreOnFlush, action: atom.action });
          }
        }

        for (let li = 0; li < pageLines.length; li++) {
          const pl = pageLines[li];
          for (let wi = 0; wi < pl.length; wi++) {
            const entry = pl[wi];
            const wordAtom = atoms[entry.atomIndex];

            // Track speed changes at the start of each word
            if (wordAtom.kind === 'word' && wordAtom.speed !== undefined && wordAtom.speed !== lastSpeed) {
              speedMarkers.push({ charIndex: charPos, speed: wordAtom.speed });
              lastSpeed = wordAtom.speed;
            } else if (wordAtom.kind === 'word' && wordAtom.speed === undefined && lastSpeed !== undefined) {
              speedMarkers.push({ charIndex: charPos, speed: DEFAULT_SPEED });
              lastSpeed = undefined;
            }

            charPos += entry.text.length;

            // Find atom index of the next word (on this page or beyond)
            let nextWordAtomIdx = atoms.length;
            for (let a = entry.atomIndex + 1; a < atoms.length; a++) {
              if (atoms[a].kind === 'word') {
                nextWordAtomIdx = a;
                break;
              }
            }

            // Collect pause and action atoms between this word and the next
            for (let a = entry.atomIndex + 1; a < nextWordAtomIdx; a++) {
              const atom = atoms[a];
              if (atom.kind === 'pause') {
                pauseMarkers.push({ charIndex: charPos, duration: atom.duration });
              } else if (atom.kind === 'action') {
                actionMarkers.push({ charIndex: charPos, ignoreOnFlush: atom.ignoreOnFlush, action: atom.action });
              }
            }

            // Add space (between words on same line)
            if (wi < pl.length - 1) charPos += 1;
          }
          // Add newline between lines
          if (li < pageLines.length - 1) charPos += 1;
        }

        pauseMarkers.sort((a, b) => a.charIndex - b.charIndex);
        speedMarkers.sort((a, b) => a.charIndex - b.charIndex);
        actionMarkers.sort((a, b) => a.charIndex - b.charIndex);
        this.pages.push({ content, pauses: pauseMarkers, speeds: speedMarkers, actions: actionMarkers });
      }

      // Handle sections that have no words (only actions/pauses)
      if (lines.length === 0 && atoms.length > 0) {
        const pauseMarkers: PauseMarker[] = [];
        const actionMarkers: ActionMarker[] = [];
        for (const atom of atoms) {
          if (atom.kind === 'pause') pauseMarkers.push({ charIndex: 0, duration: atom.duration });
          else if (atom.kind === 'action') actionMarkers.push({ charIndex: 0, ignoreOnFlush: atom.ignoreOnFlush, action: atom.action });
        }
        this.pages.push({ content: '', pauses: pauseMarkers, speeds: [], actions: actionMarkers });
      }
    }

    // --- Start playback ---------------------------------------------------
    this.currentPageIndex = 0;
    this.startTypingPage();
  }

  // ---------------------------------------------------------------------------
  // Typing animation
  // ---------------------------------------------------------------------------

  private startTypingPage() {
    this.stopAll();
    this.displayedText.set('');
    this.currentCharIndex = 0;
    this.currentPauseIdx = 0;
    this.currentSpeedIdx = 0;
    this.currentActionIdx = 0;
    this.currentSpeed = DEFAULT_SPEED;
    this.isPageComplete.set(false);

    if (this.currentPageIndex >= this.pages.length) return;

    const page = this.pages[this.currentPageIndex];
    this.pageString = page.content;

    // Apply initial speed if the page starts with a speed marker at char 0
    if (page.speeds.length > 0 && page.speeds[0].charIndex === 0) {
      this.currentSpeed = page.speeds[0].speed;
      this.currentSpeedIdx = 1;
    }

    this.beginTypingInterval();
  }

  private beginTypingInterval() {
    this.stopTyping();
    this.typingInterval = setInterval(() => this.tickTyping(), this.currentSpeed);
  }

  private tickTyping() {
    if (this.currentCharIndex < this.pageString.length) {
      this.currentCharIndex++;
      while (
        this.currentCharIndex < this.pageString.length &&
        this.isSeparator(this.pageString[this.currentCharIndex])
      ) {
        this.currentCharIndex++;
      }
      this.displayedText.set(this.pageString.slice(0, this.currentCharIndex));

      const page = this.pages[this.currentPageIndex];

      // Check if we hit a speed-change point
      if (this.currentSpeedIdx < page.speeds.length) {
        const sp = page.speeds[this.currentSpeedIdx];
        if (this.currentCharIndex >= sp.charIndex) {
          this.currentSpeedIdx++;
          this.currentSpeed = sp.speed;
          // Restart interval with the new speed
          this.stopTyping();
          this.typingInterval = setInterval(() => this.tickTyping(), this.currentSpeed);
        }
      }

      // Check if we hit an action point
      if (this.currentActionIdx < page.actions.length) {
        const actionMarker = page.actions[this.currentActionIdx];
        if (this.currentCharIndex >= actionMarker.charIndex) {
          this.currentActionIdx++;
          queueMicrotask(() => actionMarker.action());
        }
      }

      // Check if we hit a pause point
      if (this.currentPauseIdx < page.pauses.length) {
        const pause = page.pauses[this.currentPauseIdx];
        if (this.currentCharIndex >= pause.charIndex) {
          this.currentPauseIdx++;
          this.stopTyping();
          this.pauseTimeout = setTimeout(() => {
            this.beginTypingInterval();
          }, pause.duration);
        }
      }
    } else {
      this.finishTypingPage();
    }
  }

  private isSeparator(ch: string): boolean {
    return ch === ' ' || ch === '\n';
  }

  private finishTypingPage() {
    this.stopAll();
    this.displayedText.set(this.pageString);

    // Fire any remaining action callbacks that haven't been executed yet
    if (this.currentPageIndex < this.pages.length) {
      const page = this.pages[this.currentPageIndex];
      for (let i = this.currentActionIdx; i < page.actions.length; i++) {
        const a = page.actions[i];
        queueMicrotask(() => a.action());
      }
      this.currentActionIdx = page.actions.length;
    }

    this.isPageComplete.set(true);
    this.hasMorePages.set(this.currentPageIndex < this.pages.length - 1);
  }

  private stopTyping() {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
  }

  private stopPause() {
    if (this.pauseTimeout) {
      clearTimeout(this.pauseTimeout);
      this.pauseTimeout = null;
    }
  }

  private stopAll() {
    this.stopTyping();
    this.stopPause();
  }

  // ---------------------------------------------------------------------------
  // Input handling
  // ---------------------------------------------------------------------------

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.code === 'Space' || event.code === 'Enter') {
      if (this.pages.length === 0) return;
      event.preventDefault();

      if (!this.isPageComplete()) {
        // Instantly fill the current page, ignoring pauses
        this.finishTypingPage();
      } else {
        this.currentPageIndex++;
        if (this.currentPageIndex < this.pages.length) {
          this.startTypingPage();
        }
      }
    }
  }
}
