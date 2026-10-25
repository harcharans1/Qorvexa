import { AfterViewInit, Directive, ElementRef, OnDestroy } from '@angular/core';

/** Fades/slides an element in the first time it scrolls into view. */
@Directive({ selector: '[appReveal]', standalone: true })
export class RevealDirective implements AfterViewInit, OnDestroy {
  private observer?: IntersectionObserver;
  constructor(private readonly el: ElementRef<HTMLElement>) {}
  ngAfterViewInit(): void {
    const node = this.el.nativeElement;
    if (typeof IntersectionObserver === 'undefined') return;
    node.classList.add('reveal');
    this.observer = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { node.classList.add('in'); this.observer?.disconnect(); }
    }, { threshold: 0.12 });
    this.observer.observe(node);
  }
  ngOnDestroy(): void { this.observer?.disconnect(); }
}
