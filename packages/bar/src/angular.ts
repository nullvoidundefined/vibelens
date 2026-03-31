import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { VibeLens } from './core/VibeLens.ts';
import { DEFAULT_OPTIONS } from './core/constants.ts';

/**
 * Angular wrapper for VibeLens.
 *
 * This file is shipped as TypeScript source and compiled by Angular CLI
 * when the consumer builds their app.
 *
 * Usage (Angular 14+ standalone):
 *
 *   import { VibeLensComponent } from 'vibelens/angular';
 *
 *   @Component({
 *     standalone: true,
 *     imports: [VibeLensComponent],
 *     template: `<vibe-lens appName="My App" theme="dark" />`,
 *   })
 *   export class MyPage {}
 *
 * Or with NgModule:
 *
 *   import { VibeLensModule } from 'vibelens/angular';
 *
 *   @NgModule({ imports: [VibeLensModule] })
 *   export class AppModule {}
 */
@Component({
  standalone: true,
  selector: 'vibe-lens',
  template: '',
  host: { style: 'display: block' },
})
export class VibeLensComponent implements OnInit, OnChanges, OnDestroy {
  @Input() basePath = DEFAULT_OPTIONS.basePath;
  @Input() position: string = DEFAULT_OPTIONS.position;
  @Input() fixed = DEFAULT_OPTIONS.fixed;
  @Input() appName = DEFAULT_OPTIONS.appName;
  @Input() theme: string = DEFAULT_OPTIONS.theme;

  private instance: InstanceType<typeof VibeLens> | null = null;

  constructor(private el: ElementRef<HTMLElement>) {}

  ngOnInit(): void {
    this.mount();
  }

  ngOnChanges(): void {
    if (this.instance) {
      this.instance.destroy();
      this.mount();
    }
  }

  ngOnDestroy(): void {
    this.instance?.destroy();
  }

  private mount(): void {
    this.instance = new VibeLens({
      basePath: this.basePath,
      position: this.position,
      fixed: this.fixed,
      appName: this.appName,
      theme: this.theme,
    });
    this.instance.mount(this.el.nativeElement);
  }
}

/** Convenience NgModule for non-standalone Angular apps. */
import { NgModule } from '@angular/core';

@NgModule({
  imports: [VibeLensComponent],
  exports: [VibeLensComponent],
})
export class VibeLensModule {}
