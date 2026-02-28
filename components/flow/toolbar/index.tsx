'use client';

import ExportDialog from './export-dialog';
import AddNode from './add-node';
import FlowUpload from './flow-upload';
import { ThemeToggle } from './theme-toggle';
import ShowJson from './show-json';

export function Toolbar() {

  return (
    <>
      <div className="pointer-events-auto absolute top-4 right-4 z-10">
        <div className="flex flex-col-reverse items-end gap-2 lg:flex-row lg:items-center">
          <AddNode />
          <div className="flex items-center gap-2">
            <ShowJson />
            <FlowUpload />
            <ExportDialog />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </>
  );
}
