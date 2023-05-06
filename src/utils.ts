import { LSPluginUserEvents } from "@logseq/libs/dist/LSPlugin.user";
import React from "react";
import dayjs from "dayjs";

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

      const github_commits = `https://api.github.com/repos/${match[1]}/${match[2]}/commits`;
      fetch(github_commits)
        .then((response) => response.json())
        .then((commits) => {
          const last_commit_raw = commits[0].commit.author.date;
          const date = new Date(last_commit_raw);
          //change date style to yyyy-MM-dd EEEE style
          const last_commit = dayjs(date).format("YYYY-MM-DD dddd");
          logseq.Editor.getPageBlocksTree(uuid!).then((data) => {
            const properties_uuid = data[0].uuid;
            logseq.Editor.upsertBlockProperty(properties_uuid, "last", `[[${last_commit}]]`);
          });
    });
  }
})
}

