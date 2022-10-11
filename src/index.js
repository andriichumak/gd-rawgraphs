import {chart} from '@rawgraphs/rawgraphs-core';
import {barchart} from '@rawgraphs/rawgraphs-charts';

import backendFactory, {ContextDeferredAuthProvider, redirectToTigerAuthentication} from '@gooddata/sdk-backend-tiger';
import {MeasureGroupIdentifier, newDimension} from '@gooddata/sdk-model';
import * as cat from './cat';

const gdWorkspace = backendFactory()
    .onHostname('https://myrtle-rattlesnake.trial.cloud.gooddata.com')
    .withAuthentication(new ContextDeferredAuthProvider(redirectToTigerAuthentication))
    .workspace('gdc_demo_764a0125-e0e7-4710-b6e6-1c570f437796');

window.addEventListener('load', async () => {
    const result = await gdWorkspace.execution()
        .forItems([cat.ProductName, cat.RevenueTop10])
        .withDimensions(newDimension([cat.ProductName, MeasureGroupIdentifier]))
        .execute();

    const allData = await result.readAll();

    const headers = allData.headerItems[0][0].map(item => item.attributeHeaderItem.name);
    const yAxesName = allData.headerItems[0][1][0].measureHeaderItem.name;
    const userData = allData.data.map((entry, i) => ({
        [yAxesName]: headers[i],
        '$': entry,
    }));

    const mapping = {
        bars: {value: yAxesName},
        size: {value: '$'},
    };

    //instantiating the chart
    const viz = chart(barchart, {
        data: userData,
        mapping,
    });

    //rendering into the HTML node
    viz.renderToDOM(document.getElementById('graph'));
});
