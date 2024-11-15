import axios from "axios";

class BackLinks {
  idListMap: Map<string, number[]> = new Map();

  has(pageName: string) {
    return this.idListMap.has(pageName);
  }

  getRandomId(pageTitle: string) {
    const maybeIdList = this.idListMap.get(pageTitle);
    if (!maybeIdList) return null;
    const randomIndex = Math.floor(Math.random() * maybeIdList.length);
    return maybeIdList[randomIndex];
  }

  async buildIdList(pageTitle: string) {
    const ids: number[] = [];
    this.idListMap.set(pageTitle, ids);

    const backlinkCount = await getBacklinkCount(pageTitle);

    const start = await getBacklinks(pageTitle);
    let continueKey = start.continueKey;
    ids.push(...start.ids);

    while (continueKey) {
      const data = await getBacklinks(pageTitle, continueKey);
      continueKey = data.continueKey;
      ids.push(...data.ids);

      console.log(
        `${pageTitle}: ${
          Math.floor((ids.length / backlinkCount) * 1000) / 10
        }% complete `
      );
    }

    console.log(`${pageTitle} finished with ${ids.length} links`);
  }

  async isValidPage(pageTitle: string) {
    return (await getBacklinkCount(pageTitle)) != -1;
  }
}

async function getBacklinkCount(pageTitle: string) {
  const url = `https://linkcount.toolforge.org/api/?page=${encodeURIComponent(pageTitle)}&namespaces=0`;

  try {
    const response = await axios.get(url);

    return response.data.wikilinks.all || -1;
  } catch (error) {
    console.error("Error fetching backlink counter:", error);
    return 0;
  }
}

async function getBacklinks(
  pageTitle: string,
  blcontinue: number | null = null
) {
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=backlinks&bltitle=${encodeURIComponent(pageTitle)}&blnamespace=0&blfilterredir=nonredirects&blredirect=true&bllimit=500${
    blcontinue ? `&blcontinue=${blcontinue}` : ""
  }`;

  try {
    const response = await axios.get(url);
    const backlinks = response.data.query.backlinks;
    const continueKey = response.data.continue
      ? response.data.continue.blcontinue
      : null;
    const ids: number[] = backlinks.map(
      (link: { pageid: number }) => link.pageid
    );
    return { ids, continueKey };
  } catch (error) {
    console.error("Error fetching backlinks:", error);
    return { ids: [], continueKey: null };
  }
}

export default BackLinks;
