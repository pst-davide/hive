import type { Editor } from 'grapesjs';
import juice from 'juice';
import {PluginOptions} from '../index';

export default (editor: Editor, opts: Required<PluginOptions>) => {
  const cmdm = editor.Commands;
  const pfx: string | null = editor.getConfig().stylePrefix ?? null;

  cmdm.add(opts.cmdInlineHtml, {
    run(editor, s, opts = {}) {
      const tmpl: string = editor.getHtml() + `<style>${editor.getCss()}</style>`;
      return juice(tmpl, {...opts.juiceOpts, ...opts});
    }
  });

  cmdm.add('export-template', {
    containerEl: null as HTMLDivElement | null,
    codeEditorHtml: null as HTMLDivElement | null,

    createCodeViewer(): any {
      return editor.CodeManager.createViewer({
        codeName: 'htmlmixed',
        theme: opts.codeViewerTheme,
      });
    },

    createCodeEditor() {
      const el: HTMLDivElement = document.createElement('div');
      const codeEditor = this.createCodeViewer();

      el.style.flex = '1 0 auto';
      el.style.boxSizing = 'border-box';
      el.className = `${pfx}export-code`;
      el.appendChild(codeEditor.getElement());

      return { codeEditor, el };
    },

    getCodeContainer(): HTMLDivElement {
      let containerEl: HTMLDivElement | null = this.containerEl;

      if (!containerEl) {
        containerEl = document.createElement('div');
        containerEl.className = `${pfx}export-container`;
        containerEl.style.display = 'flex';
        containerEl.style.gap = '5px';
        containerEl.style.flexDirection = 'column';
        containerEl.style.justifyContent = 'space-between';
        this.containerEl = containerEl;
      }

      return containerEl;
    },


    run(editor) {
      let { codeEditorHtml } = this as any;
      const container: HTMLDivElement = this.getCodeContainer();

      // Init code viewer if not yet instantiated
      if (!codeEditorHtml) {
        const codeViewer = this.createCodeEditor();
        codeEditorHtml = codeViewer.codeEditor;
        this.codeEditorHtml = codeEditorHtml;

        if(opts.modalLabelExport){
          let labelEl: HTMLDivElement = document.createElement('div');
          labelEl.className = `${pfx}export-label`;
          labelEl.innerHTML = opts.modalLabelExport;
          container.appendChild(labelEl);
        }

        container.appendChild(codeViewer.el);
      }

      editor.Modal.open({
        title: opts.modalTitleExport,
        content: container,
      });


      if (codeEditorHtml) {
        const tmpl: string = `${editor.getHtml()}<style>${editor.getCss()}</style>`;
        codeEditorHtml.setContent(opts.inlineCss ? juice(tmpl, opts.juiceOpts) : tmpl);
        codeEditorHtml.editor.refresh();
      }
    },
  })
}
