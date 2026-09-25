/* Navid Salahian — site behaviour (jQuery) */
$(function () {
  'use strict';

  var data = window.SITE_DATA || { topics: [], papers: [] };

  /* ---------- Email: assembled here so the address is not in the HTML ---------- */
  $('[data-email-user]').each(function () {
    var $link = $(this);
    var address = $link.data('email-user') + '@' + $link.data('email-domain');
    $link.attr('href', 'mailto:' + address);
    if ($link.is('[data-email-show]')) {
      $link.text(address);
    }
  });

  /* ---------- BibTeX: show/hide and copy ---------- */
  $('.bib-toggle').on('click', function () {
    var $button = $(this);
    var isOpen = $button.attr('aria-expanded') === 'true';
    $button.attr('aria-expanded', String(!isOpen));
    $('#' + $button.attr('aria-controls')).prop('hidden', isOpen);
  });

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var $area = $('<textarea readonly>').val(text)
        .css({ position: 'fixed', top: 0, left: 0, opacity: 0 })
        .appendTo('body');
      $area[0].select();
      try {
        if (document.execCommand('copy')) { resolve(); } else { reject(); }
      } catch (error) {
        reject(error);
      }
      $area.remove();
    });
  }

  $('.bib-copy').on('click', function () {
    var $button = $(this);
    copyText($button.siblings('pre').text()).then(function () {
      $button.text('Copied');
      setTimeout(function () { $button.text('Copy BibTeX'); }, 1800);
    }, function () {
      $button.text('Copy failed: select the text and copy it manually');
    });
  });

  /* ---------- Papers-by-topics matrix ---------- */
  function hasTopic(paperId, topic) {
    for (var i = 0; i < data.papers.length; i++) {
      if (data.papers[i].id === paperId) {
        return data.papers[i].topics.indexOf(topic) !== -1;
      }
    }
    return false;
  }

  function buildMatrix(interactive) {
    var $table = $('<table class="matrix">');
    var $headRow = $('<tr>').append('<td class="matrix__corner"></td>');

    $.each(data.topics, function (_, topic) {
      var $control = interactive
        ? $('<button type="button" class="topic" aria-pressed="false">')
        : $('<a class="topic">').attr('href', 'publications.html#topic=' + topic.key);
      $control.attr('data-topic', topic.key).text(topic.label);
      $headRow.append($('<th scope="col">').attr('data-topic', topic.key).append($control));
    });
    $table.append($('<thead>').append($headRow));

    var $body = $('<tbody>');
    $.each(data.papers, function (_, paper) {
      var $row = $('<tr>').attr('data-paper', paper.id);
      var $label = $('<a>').attr('href', (interactive ? '' : 'publications.html') + '#' + paper.id).text(paper.short);
      $row.append($('<th scope="row">').append($label));

      $.each(data.topics, function (_, topic) {
        var on = paper.topics.indexOf(topic.key) !== -1;
        $row.append(
          $('<td>').attr('data-topic', topic.key).addClass(on ? 'v1' : 'v0')
            .append($('<span aria-hidden="true">').text(on ? '1' : '0'))
            .append($('<span class="visually-hidden">').text(topic.label + ': ' + (on ? 'yes' : 'no')))
        );
      });
      $body.append($row);
    });
    return $table.append($body);
  }

  function addCrosshair($matrix) {
    function clear() {
      $matrix.find('.is-cross').removeClass('is-cross');
    }
    $matrix.on('mouseenter focusin', 'td[data-topic], thead th[data-topic]', function () {
      clear();
      $matrix.find('tbody td[data-topic="' + $(this).attr('data-topic') + '"]').addClass('is-cross');
      if (this.tagName === 'TD') {
        $(this).closest('tr').addClass('is-cross');
      }
    });
    $matrix.on('mouseenter focusin', 'tbody th', function () {
      clear();
      $(this).closest('tr').addClass('is-cross');
    });
    $matrix.on('mouseleave', clear);
    $matrix.on('focusout', function (event) {
      if (!$matrix[0].contains(event.relatedTarget)) {
        clear();
      }
    });
  }

  $('[data-matrix]').each(function () {
    var $mount = $(this);
    var interactive = $mount.attr('data-matrix') === 'filter';
    var $matrix = buildMatrix(interactive);
    $mount.empty().append($matrix);
    addCrosshair($matrix);
    if (interactive) {
      setUpFilter($matrix);
    }
  });

  /* ---------- Matrix as a filter (publications page) ---------- */
  function setUpFilter($matrix) {
    var $pubs = $('.pub');
    var $groups = $('.pub-group');
    var $message = $('#filter-message');
    var $clear = $('#filter-clear');
    var current = null;

    function applyFilter(topic) {
      var $button = topic ? $matrix.find('.topic[data-topic="' + topic + '"]') : $();
      if (topic && !$button.length) {
        topic = null;
      }
      current = topic;

      $matrix.find('.topic').attr('aria-pressed', 'false');
      $matrix.find('.is-selected').removeClass('is-selected');
      $matrix.find('tbody tr').removeClass('is-dim');

      if (!topic) {
        $pubs.prop('hidden', false);
        $groups.prop('hidden', false);
        $message.text('');
        $clear.prop('hidden', true);
        if (window.location.hash.indexOf('#topic=') === 0) {
          history.replaceState(null, '', window.location.pathname + window.location.search);
        }
        return;
      }

      $button.attr('aria-pressed', 'true');
      $matrix.find('tbody td[data-topic="' + topic + '"]').addClass('is-selected');
      $matrix.find('tbody tr').each(function () {
        $(this).toggleClass('is-dim', !hasTopic($(this).attr('data-paper'), topic));
      });

      var shown = 0;
      $pubs.each(function () {
        var match = hasTopic(this.id, topic);
        $(this).prop('hidden', !match);
        if (match) { shown += 1; }
      });
      $groups.each(function () {
        $(this).prop('hidden', $(this).find('.pub').not('[hidden]').length === 0);
      });

      $message.text('Showing ' + shown + ' of ' + $pubs.length + ' papers on ' +
        $button.text().toLowerCase() + '.');
      $clear.prop('hidden', false);
      history.replaceState(null, '', '#topic=' + topic);
    }

    $matrix.on('click', '.topic', function () {
      var topic = $(this).attr('data-topic');
      applyFilter(current === topic ? null : topic);
    });

    $clear.on('click', function () {
      applyFilter(null);
    });

    var match = window.location.hash.match(/^#topic=([\w-]+)$/);
    if (match) {
      applyFilter(match[1]);
    }
  }
});
