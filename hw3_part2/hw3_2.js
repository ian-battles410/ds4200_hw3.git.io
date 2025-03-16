// Load the data
const socialMedia = d3.csv(
  'socialMedia.csv'
);

// Once the data is loaded, proceed with plotting
socialMedia.then(function (data) {
  // Convert string values to numbers
  data.forEach(function (d) {
    d.Likes = +d.Likes;
  });

  // Define the dimensions and margins for the SVG
  let width = 600,
    height = 400;

  let margin = {
    top: 30,
    bottom: 50,
    left: 50,
    right: 30,
  };
  // Create the SVG container
  svg = d3
    .select('#boxplot')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', 'lightyellow');

  // Set up scales for x and y axes
  // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
  // d3.min(data, d => d.Likes) to achieve the min value and
  // d3.max(data, d => d.Likes) to achieve the max value
  // For the domain of the xscale, you can list all four platforms or use
  // [...new Set(data.map(d => d.Platform))] to achieve a unique list of the platform
  const xScale =  d3.scaleBand()
        .range([margin.left, width - margin.right])
        .domain([...new Set(data.map(d => d.Platform))])
        .padding(0.5);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.Likes), d3.max(data, d => d.Likes)])
        .range([height - margin.bottom, margin.top]);
   
    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft().scale(yScale));

    svg.append('g')
          .attr('transform', `translate(0,${height - margin.bottom})`)
          .call(d3.axisBottom().scale(xScale));

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - margin.top + 15)
        .style("text-anchor", "middle")
        .text("Platform");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", 0 - (height / 2))
        .attr("y", margin.left/3)
        .style("text-anchor", "middle")
        .text("Likes");

  const rollupFunction = function (groupData) {
    const values = groupData.map(d => d.Likes).sort(d3.ascending);
    const min = d3.min(values);
    const max = d3.max(values);
    const q1 = d3.quantile(values, 0.25);
    const q3 = d3.quantile(values, 0.75);
    const median = d3.median(values);
    return {min, max, median, q1, q3};
  };

  // groups data by platform
  const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.Platform);

  // place boxplots on x-axis by platform
  quantilesByGroups.forEach((quantiles, Platform) => {
    const x = xScale(Platform);
    const boxWidth = xScale.bandwidth();
    // Draw vertical lines
    svg
      .append('line')
      .attr('x1', x + boxWidth/2)
      .attr('x2', x + boxWidth/2)
      .attr('y1', yScale(quantiles.min))
      .attr('y2', yScale(quantiles.max))
      .attr("stroke", "black");

    // Draw box
    svg
      .append('rect')
      .attr('x', x)
      .attr('y', yScale(quantiles.q3))
      .attr('width', boxWidth)
      .attr('height', yScale(quantiles.q1) - yScale(quantiles.q3))
      .attr('stroke', 'black')

    // Draw median line
    svg
      .append('line')
      .attr('x1', x)
      .attr('x2', x + boxWidth / 2)
      .attr('y1', yScale(quantiles.median))
	  .attr('y2', yScale(quantiles.median))
      .attr('stroke', 'black')
  });
});

// Prepare you data and load the data again.
// This data should contains three columns, platform, post type and average number of likes.
const socialMediaAvg = d3.csv('socialMediaAvg.csv');

socialMediaAvg.then(function (data) {
  // Convert string values to numbers
  data.forEach(function (d) {
    d.Likes = +d.Likes;
  });

  // Define the dimensions and margins for the SVG
  let width = 500,
    height = 500;
  let margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
  };

  // Create the SVG container
  svg = d3
    .select('#barplot')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', 'lightyellow');

  // Define four scales
  // Scale x0 is for the platform, which divide the whole scale into 4 parts
  // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
  // Recommend to add more spaces for the y scale for the legend
  // Also need a color scale for the post type

  const x0 = d3
    .scaleBand()
    .domain([...new Set(data.map(d => d.Platform))])
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const x1 = d3
    .scaleBand()
    .domain([...new Set(data.map(d => d.PostType))])
    .range([0, x0.bandwidth()])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, d => d.Likes)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const color = d3
    .scaleOrdinal()
    .domain([...new Set(data.map(d => d.PostType))])
    .range(['#1f77b4', '#ff7f0e', '#2ca02c']);

  // Add scales x0 and y
  svg
    .append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x0));

  svg
    .append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  // Add x-axis label
  svg
    .append('text')
    .text('Platform')
    .attr('x', 0 - height / 2)
    .attr('y', 25)
    .attr('transform', 'rotate(-90)');

  // Add y-axis label
  svg
    .append('text')
    .text('Likes')
    .attr('x', width / 2)
    .attr('y', height - 15);

  // Group container for bars
  const barGroups = svg
    .selectAll('bar')
    .data(data)
    .enter()
    .append('g')
    .attr('transform', d => `translate(${x0(d.Platform)},0)`);

  // Draw bars
  barGroups
    .append('rect')
    .attr('x', d => x1(d.PostType))
    .attr('y', d => y(d.Likes))
    .attr('width', x1.bandwidth())
    .attr('height', d => height - margin.bottom - y(d.Likes))
    .attr('fill', d => color(d.PostType));

  // Add the legend
  const legend = svg
    .append('g')
    .attr('transform', `translate(${width - 150}, ${margin.top})`);

  const types = [...new Set(data.map(d => d.PostType))];

  types.forEach((type, i) => {
    // Already have the text information for the legend.
    // Now add a small square/rect bar next to the text with different color.
    legend
      .append('text')
      .attr('x', 20)
      .attr('y', i * 20 + 12)
      .text(type)
      .attr('alignment-baseline', 'middle');

    legend
      .append('rect')
      .attr('x', 0)
      .attr('y', i * 20)
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', color(type));
  });
});

// Prepare you data and load the data again.
// This data should contains two columns, date (3/1-3/7) and average number of likes.

const socialMediaTime = d3.csv('socialMediaTime.csv');

socialMediaTime.then(function (data) {
  // Convert string values to numbers
  data.forEach(function (d) {
    d.Likes = +d.Likes;
  });

  // Define the dimensions and margins for the SVG
  let width = 500,
    height = 500;
  let margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
  };

  // Create the SVG container
  svg = d3
    .select('#lineplot')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('background', 'lightyellow');

  // Set up scales for x and y axes
  let yscale = d3
    .scaleLinear()
    .domain(d3.extent(data, d => d.Likes))
    .range([height - margin.bottom, margin.top]);

  let xscale = d3
    .scaleBand()
    .domain(data.map(d => d.Date))
    .range([margin.left, width - margin.right])
    .padding(0.5);

  // Draw the axis, you can rotate the text in the x-axis here
  let xAxis = svg
    .append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xscale));

  xAxis
    .selectAll('text')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end');

  // Add x-axis label
  svg
    .append('text')
    .text('Likes')
    .attr('x', 0 - height / 2)
    .attr('y', 25)
    .attr('transform', 'rotate(-90)');

  // Add y-axis label
  svg
    .append('text')
    .text('Date')
    .attr('x', width / 2)
    .attr('y', height - 15);

  // Draw the line and path. Remember to use curveNatural.
  let line = d3
    .line()
    .x(d => xscale(d.Date))
    .y(d => yscale(d.Likes))
    .curve(d3.curveNatural);

  let path = svg
    .append('path')
    .datum(data)
    .attr('stroke', 'black')
    .attr('stroke-width', 2)
    .attr('d', line)
    .attr('fill', 'none');


  // Add data points

  svg
    .selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('cx', d => xscale(d.Date))
    .attr('cy', d => yscale(d.Likes))
    .attr('r', 4);


});
