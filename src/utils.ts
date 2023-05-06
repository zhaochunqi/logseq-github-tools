import { LSPluginUserEvents } from "@logseq/libs/dist/LSPlugin.user";
import React from "react";

let _visible = logseq.isMainUIVisible;

function subscribeLogseqEvent<T extends LSPluginUserEvents>(
  eventName: T,
  handler: (...args: any) => void
) {
  logseq.on(eventName, handler);
  return () => {
    logseq.off(eventName, handler);
  };
}

const subscribeToUIVisible = (onChange: () => void) =>
  subscribeLogseqEvent("ui:visible:changed", ({ visible }) => {
    _visible = visible;
    onChange();
  });

export const useAppVisible = () => {
  return React.useSyncExternalStore(subscribeToUIVisible, () => _visible);
};

export const updateCurrentPageProperty = () => {
  // get current page
  logseq.Editor.getCurrentPage().then((page) => {
    console.log(page);
    const name = page?.originalName;
    const uuid = page?.uuid;

    //match name using regex with style github.com/xx/xxx
    const match = name?.match(/github\.com\/(.*)\/(.*)/);
    if (match) {
      console.log("match");

      const github_url = `https://github.com/${match[1]}/${match[2]}`;

      logseq.Editor.getPageBlocksTree(uuid!).then((data) => {
        const properties_uuid = data[0].uuid;
        logseq.Editor.upsertBlockProperty(properties_uuid, "url", github_url);
      });
    }
  });
};
