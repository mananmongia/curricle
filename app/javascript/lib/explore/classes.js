import * as d3 from 'd3'
import apolloClient from 'apollo'

var colorLeft = '#D10F84'
var colorRight = '#00ADF0'
var colorMix = '#2C3194'

var documentWidth = window.innerWidth

var margin = {top: 40, right: 1, bottom: 10, left: 1}
var width = documentWidth / 2 - margin.left - margin.right
var height = 100 - margin.top - margin.bottom

var courseTypeSvg = d3.select('#courseTypeVis').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

var departmentSvg = d3.select('#departmentVis').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

var classSvg = d3.select('#classVis').append('svg')
  .attr('width', width * 2)
  .attr('height', 0)
  .append('g')
  .attr('transform', 'translate(' + 0 + ',' + 40 + ')')

var courseTypeTextScale = d3.scaleLinear()
  .range([12, 16])

var courseTypeBarScale = d3.scaleLinear()
  .range([width, 0])

var courseTypeAxis = d3.axisTop(courseTypeBarScale).ticks(5)

var departmentTextScale = d3.scaleLinear()
  .range([12, 16])

var departmentBarScale = d3.scaleLinear()
  .range([0, width])

var departmentAxis = d3.axisTop(departmentBarScale).ticks(5)

var departmentTextScaleMax, nestedCourseTypeDataMax

var fullData

var courseTypeGradient = courseTypeSvg.append('defs')
  .append('linearGradient')
  .attr('id', 'courseTypeGradient')

courseTypeGradient.append('stop')
  .attr('stop-color', '#fff')
  .attr('offset', '0')

courseTypeGradient.append('stop')
  .attr('stop-color', colorLeft)
  .attr('offset', '1')

var departmentGradient = departmentSvg.append('defs')
  .append('linearGradient')
  .attr('id', 'departmentGradient')

departmentGradient.append('stop')
  .attr('stop-color', colorRight)
  .attr('offset', '0')

departmentGradient.append('stop')
  .attr('stop-color', '#fff')
  .attr('offset', '1')

function loadFullData () {
  var jsonQuery = '{ course_counts { component department count } }'

  apolloClient.query(jsonQuery).done(function (response) {
    fullData = response.data.course_counts
    appendAxis()
    setDepartmentData(response.data.course_counts)
    setCourseTypeData(response.data.course_counts)
  })
}

function appendAxis () {
  departmentSvg.append('g')
    .attr('class', 'axis departmentAxis')
    .attr('transform', 'translate(-1,-15)')
    .call(departmentAxis)
    .style('opacity', 0)
    .transition()
    .duration(1000)
    .style('opacity', 1)

  courseTypeSvg.append('g')
    .attr('class', 'axis courseTypeAxis')
    .attr('transform', 'translate(1,-15)')
    .call(courseTypeAxis)
    .style('opacity', 0)
    .transition()
    .duration(1000)
    .style('opacity', 1)

  d3.selectAll('.domain')
    .style('display', 'none')
}

loadFullData()

function setDepartmentData (data) {
  var nestedDepartmentData = d3.nest()
    .key(function (d) { return d.department })
    .rollup(function (v) {
      return {
        count: d3.sum(v, function (d) { return d.count })
      }
    })
    .entries(data)

  d3.select('#departmentVis')
    .select('svg')
    .transition()
    .delay(500)
    .duration(1000)
    .attr('height', nestedDepartmentData.length * 20 + 22)

  nestedDepartmentData.sort(function (a, b) {
    return b.value.count - a.value.count
  })

  departmentTextScaleMax = d3.max(nestedDepartmentData, function (d) { return d.value.count })

  departmentTextScale.domain([0, departmentTextScaleMax])
  departmentBarScale.domain([0, departmentTextScaleMax])

  departmentSvg.select('.axis').transition(1000).call(departmentAxis)

  setDepartmentVis(nestedDepartmentData)
}

function setCourseTypeData (data, expand) {
  var nestedCourseTypeData = d3.nest()
    .key(function (d) { return d.component })
    .rollup(function (v) {
      return {
        count: d3.sum(v, function (d) { return d.count })
      }
    })
    .entries(data)

  if (expand) {
    d3.select('#courseTypeVis')
      .select('svg')
      .transition()
      .attr('height', nestedCourseTypeData.length * 20 + 22)
  } else {
    d3.select('#courseTypeVis')
      .select('svg')
      .transition()
      .delay(500)
      .duration(1000)
      .attr('height', nestedCourseTypeData.length * 20 + 22)
  }

  nestedCourseTypeData.sort(function (a, b) {
    return b.value.count - a.value.count
  })

  nestedCourseTypeDataMax = d3.max(nestedCourseTypeData, function (d) { return d.value.count })

  courseTypeTextScale.domain([0, nestedCourseTypeDataMax])
  courseTypeBarScale.domain([0, nestedCourseTypeDataMax])

  courseTypeSvg.select('.axis').transition(1000).call(courseTypeAxis)

  setCourseTypeVis(nestedCourseTypeData)
}

function setCourseTypeVis (data) {
  var courseTypeRect = courseTypeSvg.selectAll('.courseTypeRect')
    .data(data, function (d) { return d.key })

  courseTypeRect.exit().remove()

  courseTypeRect.transition().duration(500)
    .attr('transform', function (d, i) {
      return 'translate(' + (courseTypeBarScale(d.value.count)) + ',' + (i * 20 - 15) + ')'
    })
    .attr('width', function (d, i) { return width - courseTypeBarScale(d.value.count) })
    .style('fill', 'url(#courseTypeGradient)')

  courseTypeRect
    .enter()
    .append('rect')
    .attr('class', function (d) { return 'courseTypeRect ' + d.key })
    .attr('transform', function (d, i) {
      return 'translate(' + (courseTypeBarScale(d.value.count)) + ',' + (i * 20 - 15) + ')'
    })
    .attr('width', function (d, i) { return width - courseTypeBarScale(d.value.count) })
    .attr('height', 18)
    .style('opacity', 0)
    .style('fill', 'url(#courseTypeGradient)')
    .on('click', dataFilter)
    .transition()
    .delay(500)
    .duration(500)
    .style('opacity', 1)

  var courseTypeText = courseTypeSvg.selectAll('.courseTypeText')
    .data(data, function (d) { return d.key })

  courseTypeText.exit().remove()

  courseTypeText.transition().duration(500)
    .style('font-size', function (d, i) { return courseTypeTextScale(d.value.count) + 'px' })
    .attr('transform', function (d, i) {
      return 'translate(' + (width - 5) + ',' + (i * 20) + ')'
    })

  courseTypeText
    .enter()
    .append('text')
    .attr('class', function (d) { return 'courseTypeText ' + d.key })
    .attr('transform', function (d, i) {
      return 'translate(' + (width - 5) + ',' + (i * 20) + ')'
    })
    .style('text-anchor', 'end')
    .style('opacity', 0)
    .style('font-size', function (d, i) { return courseTypeTextScale(d.value.count) + 'px' })
    .text(function (d) { return d.key })
    .on('click', dataFilter)
    .transition()
    .delay(500)
    .duration(500)
    .style('opacity', 1)
}

function setDepartmentVis (data) {
  var departmentRect = departmentSvg.selectAll('.departmentRect')
    .data(data, function (d) { return d.key })

  departmentRect.exit().remove()

  departmentRect.transition().duration(500)
    .attr('transform', function (d, i) {
      return 'translate(' + (0) + ',' + (i * 20 - 15) + ')'
    })
    .style('fill', 'url(#departmentGradient)')
    .attr('width', function (d, i) { return departmentBarScale(d.value.count) })

  departmentRect
    .enter()
    .append('rect')
    .attr('class', function (d) { return 'departmentRect ' + d.key })
    .attr('transform', function (d, i) {
      return 'translate(' + (0) + ',' + (i * 20 - 15) + ')'
    })
    .attr('width', function (d, i) { return departmentBarScale(d.value.count) })
    .attr('height', 18)
    .style('opacity', 0)
    .style('fill', 'url(#departmentGradient)')
    .on('click', dataFilter)
    .transition()
    .delay(500)
    .duration(500)
    .style('opacity', 1)

  var departmentText = departmentSvg.selectAll('.departmentText')
    .data(data, function (d) { return d.key })

  departmentText.exit().remove()

  departmentText.transition().duration(500)
    .style('font-size', function (d, i) { return departmentTextScale(d.value.count) + 'px' })
    .attr('transform', function (d, i) {
      return 'translate(' + 5 + ',' + (i * 20) + ')'
    })

  departmentText
    .enter()
    .append('text')
    .attr('class', function (d) { return 'departmentText ' + d.key })
    .attr('transform', function (d, i) { return 'translate(' + 5 + ',' + (i * 20) + ')' })
    .style('text-anchor', 'start')
    .style('opacity', 0)
    .style('font-size', function (d, i) { return departmentTextScale(d.value.count) + 'px' })
    .text(function (d) { return d.key })
    .on('click', dataFilter)
    .transition()
    .delay(500)
    .duration(500)
    .style('opacity', 1)
}

var filterDatumDepartment
var filterDatumCourseType
var filteredData

function dataFilter () {
  if (this.classList[0] === 'departmentText' || this.classList[0] === 'departmentRect') {
    if (filterDatumDepartment === this.__data__.key) {
      filterDatumDepartment = undefined
      d3.select(this).style('fill', 'black')
    } else {
      filterDatumDepartment = this.__data__.key
      d3.selectAll('.departmentText').style('fill', 'black')
      d3.selectAll('.departmentRect').style('fill', 'url(#departmentGradient)')
      d3.select(this).style('fill', colorMix)
    }
  } else if (this.classList[0] === 'courseTypeText' || this.classList[0] === 'courseTypeRect') {
    if (filterDatumCourseType === this.__data__.key) {
      filterDatumCourseType = undefined
      d3.select(this).style('fill', 'black')
    } else {
      filterDatumCourseType = this.__data__.key
      d3.selectAll('.courseTypeText').style('fill', 'black')
      d3.selectAll('.courseTypeRect').style('fill', 'url(#courseTypeGradient)')
      d3.select(this).style('fill', colorMix)
    }
  }

  if (typeof filterDatumDepartment !== 'undefined' && typeof filterDatumCourseType !== 'undefined') {
    filteredData = fullData.filter(function (d) { return d.component === filterDatumCourseType && d.department === filterDatumDepartment })
    setCourseTypeData(filteredData)
    setDepartmentData(filteredData)
    loadClassData(filteredData)
  } else if (typeof filterDatumDepartment === 'undefined' && typeof filterDatumCourseType === 'string') {
    classSvg.selectAll('.classText').remove()
    filteredData = fullData.filter(function (d) { return d.component === filterDatumCourseType })
    setDepartmentData(filteredData, true)
  } else if (typeof filterDatumCourseType === 'undefined' && typeof filterDatumDepartment === 'string') {
    classSvg.selectAll('.classText').remove()
    filteredData = fullData.filter(function (d) { return d.department === filterDatumDepartment })
    setCourseTypeData(filteredData, true)
  } else {
    setCourseTypeData(fullData, true)
    setDepartmentData(fullData, true)
  }
}

window.addEventListener('resize', resizing)

function resizing () {
  if (documentWidth !== window.innerWidth) {
    documentWidth = window.innerWidth
    width = documentWidth / 2 - margin.left - margin.right

    d3.select('#departmentVis')
      .select('svg')
      .transition()
      .attr('width', width)

    d3.select('#courseTypeVis')
      .select('svg')
      .transition()
      .attr('width', width)

    courseTypeBarScale.range([width, 0])
    departmentBarScale.range([0, width])

    courseTypeSvg.select('.axis').transition(1000).call(courseTypeAxis)
    departmentSvg.select('.axis').transition(1000).call(departmentAxis)

    d3.selectAll('.departmentRect').transition().duration(500)
      .attr('width', function (d, i) { return departmentBarScale(d.value.count) })

    d3.selectAll('.courseTypeRect').transition().duration(500)
      .attr('transform', function (d, i) {
        return 'translate(' + (courseTypeBarScale(d.value.count)) + ',' + (i * 20 - 15) + ')'
      })
      .attr('width', function (d, i) { return width - courseTypeBarScale(d.value.count) })

    d3.selectAll('.courseTypeText').transition().duration(500)
      .attr('transform', function (d, i) {
        return 'translate(' + (width - 5) + ',' + (i * 20) + ')'
      })
  }
}

function loadClassData (data) {
  var searchComponent = data[0].component.toUpperCase().replace(/\s/g, '_').replace(/\s/g, '_').replace(/[`~!@#$%^&*()|+\-=?:'",.<>{}[\]\\/]/gi, '')

  var searchDepartment = data[0].department.toUpperCase().replace(/\s/g, '_').replace(/\s/g, '_').replace(/[`~!@#$%^&*()|+\-=?:'",.<>{}[\]\\/]/gi, '')

  var jsonQuery = '{ courses(departments: [' + searchDepartment + '], components: [' + searchComponent + '], per_page: 500) { id title component } }'

  apolloClient.query(jsonQuery)
    .done(function (response) {
      classVisualization(response.data.courses)
    })
}

function classVisualization (data) {
  d3.select('#classVis')
    .select('svg')
    .transition()
    .attr('height', data.length * 20 + 100)

  var classText = classSvg.selectAll('.classText')
    .data(data)

  classText
    .enter()
    .append('text')
    .attr('class', function (d) { return 'classText ' })
    .attr('transform', function (d, i) {
      return 'translate(' + (width - width / 3) + ',' + (i * 20) + ')'
    })
    .style('text-anchor', 'left')
    .style('opacity', 0)
    .style('font-size', function (d, i) { return 12 + 'px' })
    .text(function (d) { return d.title })
  // .on('click', dataFilter)
    .transition()
    .delay(500)
    .duration(500)
    .style('opacity', 1)
}