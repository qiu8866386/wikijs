<template lang="pug">
  v-app(v-scroll='upBtnScroll', :dark='$vuetify.theme.dark', :class='$vuetify.rtl ? `is-rtl` : `is-ltr`')
    nav-header(v-if='!printView')
    v-navigation-drawer(
      v-if='navMode !== `NONE` && !printView'
      :class='$vuetify.theme.dark ? `grey darken-4-d4` : `primary`'
      dark
      app
      clipped
      mobile-breakpoint='600'
      :temporary='$vuetify.breakpoint.smAndDown'
      v-model='navShown'
      :right='$vuetify.rtl'
      )
      vue-scroll(:ops='scrollStyle')
        nav-sidebar(:color='$vuetify.theme.dark ? `grey darken-4-d4` : `primary`', :items='sidebarDecoded', :nav-mode='navMode')

    v-fab-transition(v-if='navMode !== `NONE`')
      v-btn(
        fab
        color='primary'
        fixed
        bottom
        :right='$vuetify.rtl'
        :left='!$vuetify.rtl'
        small
        @click='navShown = !navShown'
        v-if='$vuetify.breakpoint.mdAndDown'
        v-show='!navShown'
        )
        v-icon mdi-menu

    v-main(ref='content')
      template(v-if='path !== `home`')
        v-toolbar(:color='$vuetify.theme.dark ? `grey darken-4-d3` : `grey lighten-3`', flat, dense, v-if='$vuetify.breakpoint.smAndUp')
          //- v-btn.pl-0(v-if='$vuetify.breakpoint.xsOnly', flat, @click='toggleNavigation')
          //-   v-icon(color='grey darken-2', left) menu
          //-   span Navigation
          v-breadcrumbs.breadcrumbs-nav.pl-0(
            :items='breadcrumbs'
            divider='/'
            )
            template(slot='item', slot-scope='props')
              v-icon(v-if='props.item.path === "/"', small, @click='goHome') mdi-home
              v-btn.ma-0(v-else, :href='props.item.path', small, text) {{props.item.name}}
          template(v-if='!isPublished')
            v-spacer
            .caption.red--text {{$t('common:page.unpublished')}}
            status-indicator.ml-3(negative, pulse)
        v-divider
      v-container.grey.pa-0(fluid, :class='$vuetify.theme.dark ? `darken-4-l3` : `lighten-4`')
        v-row.page-header-section(no-gutters, align-content='center', style='height: 90px;')
          v-col.page-col-content.is-page-header(
            :offset-xl='tocPosition === `left` ? 2 : 0'
            :offset-lg='tocPosition === `left` ? 3 : 0'
            :xl='tocPosition === `right` ? 10 : false'
            :lg='tocPosition === `right` ? 9 : false'
            style='margin-top: auto; margin-bottom: auto;'
            :class='$vuetify.rtl ? `pr-4` : `pl-4`'
            )
            .page-header-headings
              .headline.grey--text(:class='$vuetify.theme.dark ? `text--lighten-2` : `text--darken-3`') {{title}}
              .caption.grey--text.text--darken-1 {{description}}
            .page-edit-shortcuts(
              v-if='editShortcutsObj.editMenuBar'
              :class='tocPosition === `right` ? `is-right` : ``'
              )
              v-btn(
                v-if='editShortcutsObj.editMenuBtn'
                @click='pageEdit'
                depressed
                small
                )
                v-icon.mr-2(small) mdi-pencil
                span.text-none {{$t(`common:actions.edit`)}}
              v-btn(
                v-if='editShortcutsObj.editMenuExternalBtn'
                :href='editMenuExternalUrl'
                target='_blank'
                depressed
                small
                )
                v-icon.mr-2(small) {{ editShortcutsObj.editMenuExternalIcon }}
                span.text-none {{$t(`common:page.editExternal`, { name: editShortcutsObj.editMenuExternalName })}}
      v-divider
      v-container.pl-5.pt-4(fluid, grid-list-xl)
        v-layout(row)
          v-flex.page-col-sd(
            v-if='tocPosition !== `off` && $vuetify.breakpoint.lgAndUp'
            :order-xs1='tocPosition !== `right`'
            :order-xs2='tocPosition === `right`'
            lg3
            xl2
            )
            v-card.page-toc-card.mb-5(v-if='tocDecoded.length')
              .overline.pa-5.pb-0(:class='$vuetify.theme.dark ? `blue--text text--lighten-2` : `primary--text`') {{$t('common:page.toc')}}
              v-list.pb-3(dense, nav, :class='$vuetify.theme.dark ? `darken-3-d3` : ``')
                template(v-for='(tocItem, tocIdx) in tocDecoded')
                  v-list-item(@click='$vuetify.goTo(tocItem.anchor, scrollOpts)')
                    v-icon(color='grey', small) {{ $vuetify.rtl ? `mdi-chevron-left` : `mdi-chevron-right` }}
                    v-list-item-title.px-3 {{tocItem.title}}
                  //- v-divider(v-if='tocIdx < toc.length - 1 || tocItem.children.length')
                  template(v-for='tocSubItem in tocItem.children')
                    v-list-item(@click='$vuetify.goTo(tocSubItem.anchor, scrollOpts)')
                      v-icon.px-3(color='grey lighten-1', small) {{ $vuetify.rtl ? `mdi-chevron-left` : `mdi-chevron-right` }}
                      v-list-item-title.px-3.caption.grey--text(:class='$vuetify.theme.dark ? `text--lighten-1` : `text--darken-1`') {{tocSubItem.title}}
                    //- v-divider(inset, v-if='tocIdx < toc.length - 1')

            v-card.page-tags-card.mb-5(v-if='tags.length > 0')
              .pa-5
                .overline.teal--text.pb-2(:class='$vuetify.theme.dark ? `text--lighten-3` : ``') {{$t('common:page.tags')}}
                v-chip.mr-1.mb-1(
                  label
                  :color='$vuetify.theme.dark ? `teal darken-1` : `teal lighten-5`'
                  v-for='(tag, idx) in tags'
                  :href='`/t/` + tag.tag'
                  :key='`tag-` + tag.tag'
                  )
                  v-icon(:color='$vuetify.theme.dark ? `teal lighten-3` : `teal`', left, small) mdi-tag
                  span(:class='$vuetify.theme.dark ? `teal--text text--lighten-5` : `teal--text text--darken-2`') {{tag.title}}
                v-chip.mr-1.mb-1(
                  label
                  :color='$vuetify.theme.dark ? `teal darken-1` : `teal lighten-5`'
                  :href='`/t/` + tags.map(t => t.tag).join(`/`)'
                  :aria-label='$t(`common:page.tagsMatching`)'
                  )
                  v-icon(:color='$vuetify.theme.dark ? `teal lighten-3` : `teal`', size='20') mdi-tag-multiple

            v-card.page-comments-card.mb-5(v-if='commentsEnabled && commentsPerms.read')
              .pa-5
                .overline.pb-2.blue-grey--text.d-flex.align-center(:class='$vuetify.theme.dark ? `text--lighten-3` : `text--darken-2`')
                  span {{$t('common:comments.sdTitle')}}
                  //- v-spacer
                  //- v-chip.text-center(
                  //-   v-if='!commentsExternal'
                  //-   label
                  //-   x-small
                  //-   :color='$vuetify.theme.dark ? `blue-grey darken-3` : `blue-grey darken-2`'
                  //-   dark
                  //-   style='min-width: 50px; justify-content: center;'
                  //-   )
                  //-   span {{commentsCount}}
                .d-flex
                  v-btn.text-none(
                    @click='goToComments()'
                    :color='$vuetify.theme.dark ? `blue-grey` : `blue-grey darken-2`'
                    outlined
                    style='flex: 1 1 100%;'
                    small
                    )
                    span.blue-grey--text(:class='$vuetify.theme.dark ? `text--lighten-1` : `text--darken-2`') {{$t('common:comments.viewDiscussion')}}
                  v-tooltip(right, v-if='commentsPerms.write')
                    template(v-slot:activator='{ on }')
                      v-btn.ml-2(
                        @click='goToComments(true)'
                        v-on='on'
                        outlined
                        small
                        :color='$vuetify.theme.dark ? `blue-grey` : `blue-grey darken-2`'
                        :aria-label='$t(`common:comments.newComment`)'
                        )
                        v-icon(:color='$vuetify.theme.dark ? `blue-grey lighten-1` : `blue-grey darken-2`', dense) mdi-comment-plus
                    span {{$t('common:comments.newComment')}}

            v-card.page-author-card.mb-5
              .pa-5
                .overline.indigo--text.d-flex(:class='$vuetify.theme.dark ? `text--lighten-3` : ``')
                  span {{$t('common:page.lastEditedBy')}}
                  v-spacer
                  v-tooltip(right, v-if='isAuthenticated')
                    template(v-slot:activator='{ on }')
                      v-btn.btn-animate-edit(
                        icon
                        :href='"/h/" + locale + "/" + path'
                        v-on='on'
                        x-small
                        v-if='hasReadHistoryPermission'
                        :aria-label='$t(`common:header.history`)'
                        )
                        v-icon(color='indigo', dense) mdi-history
                    span {{$t('common:header.history')}}
                .page-author-card-name.body-2.grey--text(:class='$vuetify.theme.dark ? `` : `text--darken-3`') {{ authorName }}
                .page-author-card-date.caption.grey--text.text--darken-1 {{ updatedAt | moment('calendar') }}

            //- v-card.mb-5
            //-   .pa-5
            //-     .overline.pb-2.yellow--text(:class='$vuetify.theme.dark ? `text--darken-3` : `text--darken-4`') Rating
            //-     .text-center
            //-       v-rating(
            //-         v-model='rating'
            //-         color='yellow darken-3'
            //-         background-color='grey lighten-1'
            //-         half-increments
            //-         hover
            //-       )
            //-       .caption.grey--text 5 votes

            v-card.page-shortcuts-card(flat)
              v-toolbar(:color='$vuetify.theme.dark ? `grey darken-4-d3` : `grey lighten-3`', flat, dense)
                v-spacer
                //- v-tooltip(bottom)
                //-   template(v-slot:activator='{ on }')
                //-     v-btn(icon, tile, v-on='on', :aria-label='$t(`common:page.bookmark`)'): v-icon(color='grey') mdi-bookmark
                //-   span {{$t('common:page.bookmark')}}
                v-tooltip(bottom)
                  template(#activator="{ on, attrs }")
                    v-btn(
                      color="primary"
                      icon
                      v-bind="attrs"
                      v-on="on"
                      @click="viewAiSummary"
                      aria-label="查看AI总结"
                    )
                      v-icon(font-size="24" color="#9e9e9e") mdi-file-chart-outline
                  span 查看AI总结
                <!-- 添加一个测试按钮用于调试 -->
                //- v-tooltip(bottom)
                //-   template(#activator="{ on, attrs }")
                //-     v-btn(
                //-       color="secondary"
                //-       icon
                //-       v-bind="attrs"
                //-       v-on="on"
                //-       @click="showAiContent"
                //-       aria-label="测试AI内容"
                //-     )
                //-       v-icon(font-size="24" color="#9e9e9e") mdi-test-tube
                //-   span 测试AI内容
                v-menu(offset-y, bottom, min-width='300')
                  template(v-slot:activator='{ on: menu }')
                    v-tooltip(bottom)
                      template(v-slot:activator='{ on: tooltip }')
                        v-btn(icon, tile, v-on='{ ...menu, ...tooltip }', :aria-label='$t(`common:page.share`)'): v-icon(color='grey') mdi-share-variant
                      span {{$t('common:page.share')}}
                  social-sharing(
                    :url='pageUrl'
                    :title='title'
                    :description='description'
                  )
                v-tooltip(bottom)
                  template(v-slot:activator='{ on }')
                    v-btn(icon, tile, v-on='on', @click='print', :aria-label='$t(`common:page.printFormat`)')
                      v-icon(:color='printView ? `primary` : `grey`') mdi-printer
                  span {{$t('common:page.printFormat')}}
                v-spacer
                v-tooltip(bottom)
                  template(#activator="{ on, attrs }")
                    v-btn(
                      color="primary"
                      icon
                      v-bind="attrs"
                      v-on="on"
                      @click="callOpenAI"
                      aria-label="生成AI总结"
                    )
                      v-icon(font-size="24" color="#9e9e9e") mdi-file-chart-outline
                  span 生成AI总结
                v-spacer
          v-flex.page-col-content(
            xs12
            :lg9='tocPosition !== `off`'
            :xl10='tocPosition !== `off`'
            :order-xs1='tocPosition === `right`'
            :order-xs2='tocPosition !== `right`'
            )
            v-tooltip(:right='$vuetify.rtl', :left='!$vuetify.rtl', v-if='hasAnyPagePermissions && editShortcutsObj && editShortcutsObj.editFab')
              template(v-slot:activator='{ on: onEditActivator }')
                v-speed-dial(
                  v-model='pageEditFab'
                  direction='top'
                  open-on-hover
                  transition='scale-transition'
                  bottom
                  :right='!$vuetify.rtl'
                  :left='$vuetify.rtl'
                  fixed
                  dark
                  )
                  template(v-slot:activator)
                    v-btn.btn-animate-edit(
                      fab
                      color='primary'
                      v-model='pageEditFab'
                      @click='pageEdit'
                      v-on='onEditActivator'
                      :disabled='!hasWritePagesPermission'
                      :aria-label='$t(`common:page.editPage`)'
                      )
                      v-icon mdi-pencil
                  v-tooltip(:right='$vuetify.rtl', :left='!$vuetify.rtl', v-if='hasReadHistoryPermission')
                    template(v-slot:activator='{ on }')
                      v-btn(
                        fab
                        small
                        color='white'
                        light
                        v-on='on'
                        @click='pageHistory'
                        )
                        v-icon(size='20') mdi-history
                    span {{$t('common:header.history')}}
                  v-tooltip(:right='$vuetify.rtl', :left='!$vuetify.rtl', v-if='hasReadSourcePermission')
                    template(v-slot:activator='{ on }')
                      v-btn(
                        fab
                        small
                        color='white'
                        light
                        v-on='on'
                        @click='pageSource'
                        )
                        v-icon(size='20') mdi-code-tags
                    span {{$t('common:header.viewSource')}}
                  v-tooltip(:right='$vuetify.rtl', :left='!$vuetify.rtl', v-if='hasWritePagesPermission')
                    template(v-slot:activator='{ on }')
                      v-btn(
                        fab
                        small
                        color='white'
                        light
                        v-on='on'
                        @click='pageConvert'
                        )
                        v-icon(size='20') mdi-lightning-bolt
                    span {{$t('common:header.convert')}}
                  v-tooltip(:right='$vuetify.rtl', :left='!$vuetify.rtl', v-if='hasWritePagesPermission')
                    template(v-slot:activator='{ on }')
                      v-btn(
                        fab
                        small
                        color='white'
                        light
                        v-on='on'
                        @click='pageDuplicate'
                        )
                        v-icon(size='20') mdi-content-duplicate
                    span {{$t('common:header.duplicate')}}
                  v-tooltip(:right='$vuetify.rtl', :left='!$vuetify.rtl', v-if='hasManagePagesPermission')
                    template(v-slot:activator='{ on }')
                      v-btn(
                        fab
                        small
                        color='white'
                        light
                        v-on='on'
                        @click='pageMove'
                        )
                        v-icon(size='20') mdi-content-save-move-outline
                    span {{$t('common:header.move')}}
                  v-tooltip(:right='$vuetify.rtl', :left='!$vuetify.rtl', v-if='hasDeletePagesPermission')
                    template(v-slot:activator='{ on }')
                      v-btn(
                        fab
                        dark
                        small
                        color='red'
                        v-on='on'
                        @click='pageDelete'
                        )
                        v-icon(size='20') mdi-trash-can-outline
                    span {{$t('common:header.delete')}}
              span {{$t('common:page.editPage')}}
            v-alert.mb-5(v-if='!isPublished', color='red', outlined, icon='mdi-minus-circle', dense)
              .caption {{$t('common:page.unpublishedWarning')}}
            .contents(ref='container')
              slot(name='contents')
            .comments-container#discussion(v-if='commentsEnabled && commentsPerms.read && !printView')
              .comments-header
                v-icon.mr-2(dark) mdi-comment-text-outline
                span {{$t('common:comments.title')}}
              .comments-main
                slot(name='comments')
    nav-footer
    notify
    search-results
    // 添加对话框来显示 OpenAI 结果
    v-dialog(v-model='aiDialog', max-width='800',class="ai-summary-dialog")
      v-card
        v-card-title
          span.headline {{ aiDialogTitle }}
          v-spacer
          v-btn(icon, @click='aiDialog = false')
            v-icon mdi-close
        v-card-text
          v-progress-linear(indeterminate, v-if='aiLoading')
          div(v-else)
            div.markdown-content(v-html='renderedResult || result')
        v-card-actions
          v-spacer
          v-btn(color='primary', @click='aiDialog = false') 关闭
    v-fab-transition
      v-btn(
        v-if='upBtnShown'
        fab
        fixed
        bottom
        :right='$vuetify.rtl'
        :left='!$vuetify.rtl'
        small
        :depressed='this.$vuetify.breakpoint.mdAndUp'
        @click='$vuetify.goTo(0, scrollOpts)'
        color='primary'
        dark
        :style='upBtnPosition'
        :aria-label='$t(`common:actions.returnToTop`)'
        )
        v-icon mdi-arrow-up
</template>

<script>
import { StatusIndicator } from 'vue-status-indicator'
import Tabset from './tabset.vue'
import NavSidebar from './nav-sidebar.vue'
import Prism from 'prismjs'
import mermaid from 'mermaid'
import { get, sync } from 'vuex-pathify'
import _ from 'lodash'
import ClipboardJS from 'clipboard'
import Vue from 'vue'
// import { Configuration, OpenAIApi } from 'openai'

Vue.component('Tabset', Tabset)

Prism.plugins.autoloader.languages_path = '/_assets/js/prism/'
Prism.plugins.NormalizeWhitespace.setDefaults({
  'remove-trailing': true,
  'remove-indent': true,
  'left-trim': true,
  'right-trim': true,
  'remove-initial-line-feed': true,
  'tabs-to-spaces': 2
})
Prism.plugins.toolbar.registerButton('copy-to-clipboard', (env) => {
  let linkCopy = document.createElement('button')
  linkCopy.textContent = 'Copy'

  const clip = new ClipboardJS(linkCopy, {
    text: () => { return env.code }
  })

  clip.on('success', () => {
    linkCopy.textContent = 'Copied!'
    resetClipboardText()
  })
  clip.on('error', () => {
    linkCopy.textContent = 'Press Ctrl+C to copy'
    resetClipboardText()
  })

  return linkCopy

  function resetClipboardText() {
    setTimeout(() => {
      linkCopy.textContent = 'Copy'
    }, 5000)
  }
})

export default {
  components: {
    NavSidebar,
    StatusIndicator
  },
  props: {
    pageId: {
      type: Number,
      default: 0
    },
    locale: {
      type: String,
      default: 'en'
    },
    path: {
      type: String,
      default: 'home'
    },
    title: {
      type: String,
      default: 'Untitled Page'
    },
    description: {
      type: String,
      default: ''
    },
    createdAt: {
      type: String,
      default: ''
    },
    updatedAt: {
      type: String,
      default: ''
    },
    tags: {
      type: Array,
      default: () => ([])
    },
    authorName: {
      type: String,
      default: 'Unknown'
    },
    authorId: {
      type: Number,
      default: 0
    },
    editor: {
      type: String,
      default: ''
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    toc: {
      type: String,
      default: ''
    },
    sidebar: {
      type: String,
      default: ''
    },
    navMode: {
      type: String,
      default: 'MIXED'
    },
    commentsEnabled: {
      type: Boolean,
      default: false
    },
    effectivePermissions: {
      type: String,
      default: ''
    },
    commentsExternal: {
      type: Boolean,
      default: false
    },
    editShortcuts: {
      type: String,
      default: ''
    },
    filename: {
      type: String,
      default: ''
    },
    aiContent: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      result: '',
      navShown: false,
      navExpanded: false,
      upBtnShown: false,
      pageEditFab: false,
      innerText: '',
      prompt: '',
      // 添加对话框控制变量
      aiDialog: false,
      aiDialogTitle: '生成AI总结',
      aiDialogMode: 'generate', // 添加AI对话框模式，'view'表示查看，'generate'表示生成
      aiLoading: false,
      scrollOpts: {
        duration: 1500,
        offset: 0,
        easing: 'easeInOutCubic'
      },
      scrollStyle: {
        vuescroll: {},
        scrollPanel: {
          initialScrollX: 0.01, // fix scrollbar not disappearing on load
          scrollingX: false,
          speed: 50
        },
        rail: {
          gutterOfEnds: '2px'
        },
        bar: {
          onlyShowBarOnScroll: false,
          background: '#42A5F5',
          hoverStyle: {
            background: '#64B5F6'
          }
        }
      },
      winWidth: 0
    }
  },
  computed: {
    isAuthenticated: get('user/authenticated'),
    commentsCount: get('page/commentsCount'),
    commentsPerms: get('page/effectivePermissions@comments'),
    editShortcutsObj: get('page/editShortcuts'),
    rating: {
      get () {
        return 3.5
      },
      set (val) {

      }
    },
    breadcrumbs() {
      return [{ path: '/', name: 'Home' }].concat(_.reduce(this.path.split('/'), (result, value, key) => {
        result.push({
          path: _.get(_.last(result), 'path', `/${this.locale}`) + `/${value}`,
          name: value
        })
        return result
      }, []))
    },
    pageUrl () { return window.location.href },
    upBtnPosition () {
      if (this.$vuetify.breakpoint.mdAndUp) {
        return this.$vuetify.rtl ? `right: 235px;` : `left: 235px;`
      } else {
        return this.$vuetify.rtl ? `right: 65px;` : `left: 65px;`
      }
    },
    sidebarDecoded () {
      return JSON.parse(Buffer.from(this.sidebar, 'base64').toString())
    },
    tocDecoded () {
      return JSON.parse(Buffer.from(this.toc, 'base64').toString())
    },
    tocPosition: get('site/tocPosition'),
    hasAdminPermission: get('page/effectivePermissions@system.manage'),
    hasWritePagesPermission: get('page/effectivePermissions@pages.write'),
    hasManagePagesPermission: get('page/effectivePermissions@pages.manage'),
    hasDeletePagesPermission: get('page/effectivePermissions@pages.delete'),
    hasReadSourcePermission: get('page/effectivePermissions@source.read'),
    hasReadHistoryPermission: get('page/effectivePermissions@history.read'),
    hasAnyPagePermissions () {
      return this.hasAdminPermission || this.hasWritePagesPermission || this.hasManagePagesPermission ||
        this.hasDeletePagesPermission || this.hasReadSourcePermission || this.hasReadHistoryPermission
    },
    printView: sync('site/printView'),
    editMenuExternalUrl () {
      // 添加安全检查，确保 editShortcutsObj 存在
      if (this.editShortcutsObj && this.editShortcutsObj.editMenuBar && this.editShortcutsObj.editMenuExternalBtn) {
        return this.editShortcutsObj.editMenuExternalUrl.replace('{filename}', this.filename)
      } else {
        return ''
      }
    },
    renderedResult() {
      if (this.result) {
        try {
          // ===== 代码块 HTML 转义保护 =====
          const fencedCodeRegex = /```(\w*)\n([\s\S]*?)\n```/g
          const protectedResult = this.result.replace(fencedCodeRegex, (match, lang, code) => {
            const safeCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;')
            return `\`\`\`${lang}\n${safeCode}\n\`\`\``
          })

          // ===== 使用 Wiki.js 自带的 markdown-it 渲染 =====
          if (window.wiki && window.wiki.$processor) {
            return window.wiki.$processor.md.render(protectedResult)

            // ===== 使用全局 markdown-it 渲染 =====
          } else if (window.markdownit) {
            const md = window.markdownit({
              html: true, // 保留 HTML 渲染
              breaks: true,
              linkify: true,
              typographer: true
            })
            return md.render(protectedResult)

            // ===== 手动 Markdown 转 HTML =====
          } else {
            const escapeHtml = (text) => {
              const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
              }
              return text.replace(/[&<>"']/g, (m) => map[m])
            }

            let html = escapeHtml(protectedResult)

            // 表格转换
            const tableRegex = /((?:\|.*\|$\n)+)(?:\|[\s\-|:]+\|$\n)((?:\|.*\|$\n?)*)/gm
            html = html.replace(tableRegex, (match, headerRow, dataRows) => {
              let tableHtml = '<table class="markdown-table">'
              const headerLines = headerRow.trim().split('\n')
              headerLines.forEach(line => {
                if (line.trim()) {
                  const headers = line.split('|').filter(h => h)
                  if (headers.length > 0) {
                    tableHtml += '<thead><tr>'
                    headers.forEach(header => {
                      tableHtml += `<th>${header.trim()}</th>`
                    })
                    tableHtml += '</tr></thead>'
                  }
                }
              })
              if (dataRows) {
                tableHtml += '<tbody>'
                const rows = dataRows.trim().split('\n')
                rows.forEach(row => {
                  if (row.trim()) {
                    const cells = row.split('|').filter(c => c)
                    if (cells.length > 0) {
                      tableHtml += '<tr>'
                      cells.forEach(cell => {
                        tableHtml += `<td>${cell.trim()}</td>`
                      })
                      tableHtml += '</tr>'
                    }
                  }
                })
                tableHtml += '</tbody>'
              }
              tableHtml += '</table>'
              return tableHtml
            })

            // 标题
            html = html.replace(/^###### (.*$)/gim, '<h6>$1</h6>')
            html = html.replace(/^##### (.*$)/gim, '<h5>$1</h5>')
            html = html.replace(/^#### (.*$)/gim, '<h4>$1</h4>')
            html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
            html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
            html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

            // 粗体 & 斜体
            html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>')

            // 代码块
            html = html.replace(/```(\w*)\n([\s\S]*?)\n```/gim, (match, lang, code) => {
              const language = lang || 'plaintext'
              return `<pre><code class="language-${language}">${escapeHtml(code)}</code></pre>`
            })

            // 行内代码
            html = html.replace(/`(.*?)`/gim, '<code>$1</code>')

            // 链接
            html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank">$1</a>')

            // 列表
            html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
            html = html.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')

            // 换行处理
            html = html.replace(/\n\n/g, '</p><p>')
            html = html.replace(/\n/g, '<br>')

            html = `<p>${html}</p>`
            return html
          }
        } catch (e) {
          console.error('Markdown 渲染出错:', e)
          return `<pre>${this.result}</pre>`
        }
      }
      return ''
    }
  },
  created() {
    this.$store.set('page/authorId', this.authorId)
    this.$store.set('page/authorName', this.authorName)
    this.$store.set('page/createdAt', this.createdAt)
    this.$store.set('page/description', this.description)
    this.$store.set('page/isPublished', this.isPublished)
    this.$store.set('page/id', this.pageId)
    this.$store.set('page/locale', this.locale)
    this.$store.set('page/path', this.path)
    this.$store.set('page/tags', this.tags)
    this.$store.set('page/title', this.title)
    this.$store.set('page/editor', this.editor)
    this.$store.set('page/updatedAt', this.updatedAt)
    if (this.effectivePermissions) {
      this.$store.set('page/effectivePermissions', JSON.parse(Buffer.from(this.effectivePermissions, 'base64').toString()))
    }
    if (this.editShortcuts) {
      this.$store.set('page/editShortcuts', JSON.parse(Buffer.from(this.editShortcuts, 'base64').toString()))
    }

    this.$store.set('page/mode', 'view')
  },
  mounted () {
    // 添加调试日志，检查aiContent是否正确传递
    // console.log('Page component props:', this.$props)
    // console.log('AI Content value:', this.aiContent)
    // 修改prompt合并方式，将所有tag中的prompt合并成一个字符串
    // 可以根据需要修改分隔符：
    // 1. 使用 '\n' 单个换行符（默认）
    // 2. 使用 '\n\n' 双换行符实现段落分隔
    // 3. 使用 '\n---\n' 带分隔线的分隔符
    // 4. 使用其他自定义分隔符
    console.log(123456789, this.$props)
    this.prompt = this.tags
      .map((tag, i) => {
        const text = tag.prompt?.trim()
        if (!text) return '' // 跳过空的
        return `第${i + 1}个提示词：${text}，`
      })
      .filter(str => str !== '')
      .join('\n')
    this.innerText = this.$refs.container.innerText
    // console.log('9999999999999999999', this.prompt)
    // console.log('88888888888888888888', this.innerText)
    if (this.$vuetify.theme.dark) {
      this.scrollStyle.bar.background = '#424242'
    }

    // -> Check side navigation visibility
    this.handleSideNavVisibility()
    window.addEventListener('resize', _.debounce(() => {
      this.handleSideNavVisibility()
    }, 500))

    // -> Highlight Code Blocks
    Prism.highlightAllUnder(this.$refs.container)

    // -> Render Mermaid diagrams
    mermaid.mermaidAPI.initialize({
      startOnLoad: true,
      theme: this.$vuetify.theme.dark ? `dark` : `default`
    })

    // -> Handle anchor scrolling
    if (window.location.hash && window.location.hash.length > 1) {
      if (document.readyState === 'complete') {
        this.$nextTick(() => {
          this.$vuetify.goTo(decodeURIComponent(window.location.hash), this.scrollOpts)
        })
      } else {
        window.addEventListener('load', () => {
          this.$vuetify.goTo(decodeURIComponent(window.location.hash), this.scrollOpts)
        })
      }
    }

    // -> Handle anchor links within the page contents
    this.$nextTick(() => {
      this.$refs.container.querySelectorAll(`a[href^="#"], a[href^="${window.location.href.replace(window.location.hash, '')}#"]`).forEach(el => {
        el.onclick = ev => {
          ev.preventDefault()
          ev.stopPropagation()
          this.$vuetify.goTo(decodeURIComponent(ev.currentTarget.hash), this.scrollOpts)
        }
      })

      window.boot.notify('page-ready')
    })
  },
  methods: {
    // 查看AI总结
    async viewAiSummary() {
      // 设置对话框标题
      this.aiDialogTitle = '查看AI总结'
      // 显示加载状态
      this.aiLoading = true
      this.result = '正在更新缓存数据...'
      this.aiDialog = true
      try {
        // 检查必要的参数是否存在
        if (!this.pageId) {
          throw new Error('缺少必要的参数: pageId')
        }

        // 通过GraphQL重新获取页面数据以更新缓存
        const query = `
          query ($pageId: Int!) {
            pages {
              single(id: $pageId) {
                id
                title
                description
                content
                aiContent
                createdAt
                updatedAt
                authorId
                authorName
                isPublished
                tags {
                  tag
                  title
                }
              }
            }
          }
        `

        const response = await fetch('/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query,
            variables: { pageId: this.pageId }
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()

        if (data.errors) {
          console.error('GraphQL errors:', data.errors)
          throw new Error(data.errors[0].message)
        }

        // 检查返回的数据结构
        if (!data.data || !data.data.pages || !data.data.pages.single) {
          throw new Error('返回的数据结构不正确')
        }

        // 从新获取的数据中提取AI内容
        const pageData = data.data.pages.single
        this.result = pageData.aiContent || '暂无AI总结内容'
      } catch (error) {
        console.error('更新缓存数据出错:', error)
        this.result = `更新缓存数据失败: ${error.message}`

        // 即使出错也尝试显示已有的aiContent
        if (this.aiContent) {
          this.result = this.aiContent
        }
      } finally {
        this.aiLoading = false

        // 在结果渲染完成后高亮代码块
        this.$nextTick(() => {
          if (this.$el && typeof Prism !== 'undefined') {
            Prism.highlightAllUnder(this.$el)
          }
        })
      }
    },
    // 添加测试方法显示AI内容
    // showAiContent() {
    //   console.log('AI Content:', this.aiContent);
    //   alert('AI Content: ' + this.aiContent || 'No AI content available');
    // },
    // 调用openAI,将提示词和文档内容传过去
    async callOpenAI() {
      // 设置对话框标题
      this.aiDialogTitle = '生成AI总结'
      // 显示对话框和加载状态
      this.aiDialog = true
      this.aiLoading = true

      try {
        const response = await fetch('/api/openai/summarize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: this.prompt,
            content: this.innerText,
            pageId: this.$props.pageId // 添加页面ID
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        this.result = data.result || data.text || JSON.stringify(data)
      } catch (error) {
        console.error('调用 OpenAI 出错:', error)
        this.result = `错误：${error.message}`
      } finally {
        this.aiLoading = false

        // 在结果渲染完成后高亮代码块
        this.$nextTick(() => {
          if (this.$el && typeof Prism !== 'undefined') {
            Prism.highlightAllUnder(this.$el)
          }
        })
      }
    },
    goHome () {
      window.location.assign('/')
    },
    toggleNavigation () {
      this.navOpen = !this.navOpen
    },
    upBtnScroll () {
      const scrollOffset = window.pageYOffset || document.documentElement.scrollTop
      this.upBtnShown = scrollOffset > window.innerHeight * 0.33
    },
    print () {
      if (this.printView) {
        this.printView = false
      } else {
        this.printView = true
        this.$nextTick(() => {
          window.print()
        })
      }
    },
    pageEdit () {
      this.$root.$emit('pageEdit')
    },
    pageHistory () {
      this.$root.$emit('pageHistory')
    },
    pageSource () {
      this.$root.$emit('pageSource')
    },
    pageConvert () {
      this.$root.$emit('pageConvert')
    },
    pageDuplicate () {
      this.$root.$emit('pageDuplicate')
    },
    pageMove () {
      this.$root.$emit('pageMove')
    },
    pageDelete () {
      this.$root.$emit('pageDelete')
    },
    handleSideNavVisibility () {
      if (window.innerWidth === this.winWidth) { return }
      this.winWidth = window.innerWidth
      if (this.$vuetify.breakpoint.mdAndUp) {
        this.navShown = true
      } else {
        this.navShown = false
      }
    },
    goToComments (focusNewComment = false) {
      this.$vuetify.goTo('#discussion', this.scrollOpts)
      if (focusNewComment) {
        document.querySelector('#discussion-new').focus()
      }
    }
  }
}
</script>

<style lang="scss">

.breadcrumbs-nav {
  .v-btn {
    min-width: 0;
    &__content {
      text-transform: none;
    }
  }
  .v-breadcrumbs__divider:nth-child(2n) {
    padding: 0 6px;
  }
  .v-breadcrumbs__divider:nth-child(2) {
    padding: 0 6px 0 12px;
  }
}

.page-col-sd {
  margin-top: -90px;
  align-self: flex-start;
  position: sticky;
  top: 64px;
  max-height: calc(100vh - 64px);
  overflow-y: auto;
  -ms-overflow-style: none;
}

.page-col-sd::-webkit-scrollbar {
  display: none;
}

.page-header-section {
  position: relative;

  > .is-page-header {
    position: relative;
  }

  .page-header-headings {
    min-height: 52px;
    display: flex;
    justify-content: center;
    flex-direction: column;
  }

  .page-edit-shortcuts {
    position: absolute;
    bottom: -33px;
    right: 10px;

    .v-btn {
      border-right: 1px solid #DDD !important;
      border-bottom: 1px solid #DDD !important;
      border-radius: 0;
      color: #777;
      background-color: #FFF !important;

      @at-root .theme--dark & {
        background-color: #222 !important;
        border-right-color: #444 !important;
        border-bottom-color: #444 !important;
        color: #CCC;
      }

      .v-icon {
        color: mc('blue', '700');
      }

      &:first-child {
        border-top-left-radius: 5px;
        border-bottom-left-radius: 5px;
      }

      &:last-child {
        border-top-right-radius: 5px;
        border-bottom-right-radius: 5px;
      }
    }
  }
}

// 添加 Markdown 内容样式
.markdown-content {
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
  }

  h1 {
    font-size: 1.75rem;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 0.3rem;
  }

  h2 {
    font-size: 1.5rem;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 0.3rem;
  }

  h3 {
    font-size: 1.25rem;
  }

  h4 {
    font-size: 1.1rem;
  }
  h5 {
    font-size: 1rem;
  }
  h6 {
    font-size: 0.9rem;
    color: #666;
  }

  p {
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  ul, ol {
    margin-bottom: 1rem;
    padding-left: 2rem;
  }

  li {
    margin-bottom: 0.25rem;
  }

  pre {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    margin-bottom: 1rem;
    tab-size: 4;

    code {
      background: none;
      padding: 0;
      font-family: 'Courier New', Courier, monospace;
      white-space: pre;
    }
  }

  code {
    background-color: #f5f5f5;
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-family: 'Courier New', Courier, monospace;
  }

  a {
    color: #1976d2;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  blockquote {
    border-left: 4px solid #ddd;
    padding: 0 1rem;
    margin: 1rem 0;
    color: #666;
  }
  // 表格样式
  .markdown-table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 1rem;
    th, td {
      border: 1px solid #ddd;
      padding: 0.5rem;
      text-align: left;
    }
    th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    tr:nth-child(even) {
      background-color: #f9f9f9;
    }
  }
}

.theme--dark {
  .breadcrumbs-nav {
    .v-btn {
      color: #FFF;
    }
  }
  .page-header-section {
    .page-header-headings {
      .headline {
        color: #FFF;
      }
    }
  }
  .page-edit-shortcuts {
    .v-btn {
      background-color: #222 !important;
      border-right-color: #444 !important;
      border-bottom-color: #444 !important;
      color: #CCC;
    }
  }
  .page-col-sd {
    background-color: #333;
  }
  .comments-container {
    .comments-header {
      color: #FFF;
    }
  }
  .v-dialog {
    .markdown-content {
      code[class*="language-"],
      pre[class*="language-"] {
        background: hsl(30, 20%, 25%) !important;
        color: white !important;
        text-shadow: 0 -.1em .2em black !important;
      }
      pre[class*="language-"] {
        border: .3em solid hsl(30, 20%, 40%) !important;
        box-shadow: 1px 1px .5em black inset !important;
        margin: .5em 0 !important;
        padding: 1em !important;
        overflow: auto !important;
      }
      :not(pre) > code[class*="language-"] {
        border: .13em solid hsl(30, 20%, 40%) !important;
        box-shadow: 1px 1px .3em -.1em black inset !important;
        padding: .15em .2em .05em !important;
        white-space: normal !important;
      }
      code {
        background-color: hsl(30, 20%, 25%) !important;
        color: #f8f8f2 !important;
      }
    }
    @at-root .theme--dark & {
      .markdown-content {
        code:not([class*="language-"]) {
          background-color: hsl(30, 20%, 25%) !important;
          color: #f8f8f2 !important;
        }
      }
    }
    // 添加更通用和具体的代码块样式以确保所有代码块都有暗色主题样式
    pre,
    .markdown-content pre {
      background-color: hsl(30, 20%, 25%) !important;
      border: .3em solid hsl(30, 20%, 40%) !important;
      box-shadow: 1px 1px .5em black inset !important;
      color: white !important;
      code,
      .markdown-content code {
        background: none !important;
        color: white !important;
      }
    }
    code:not([class*="language-"]),
    .markdown-content code:not([class*="language-"]) {
      background-color: hsl(30, 20%, 25%) !important;
      color: #f8f8f2 !important;
    }
    // 特别针对普通pre和code元素的暗色主题样式
    pre:not([class*="language-"]) {
      background-color: hsl(30, 20%, 25%) !important;
      border: .3em solid hsl(30, 20%, 40%) !important;
      box-shadow: 1px 1px .5em black inset !important;
      color: white !important;
      padding: 1rem !important;
      border-radius: 4px !important;
      overflow-x: auto !important;
      code {
        background: none !important;
        color: white !important;
        padding: 0 !important;
      }
    }
  }
.ai-summary-dialog pre[class*="language-"],
.ai-summary-dialog code[class*="language-"] {
  background-color: #1e1e1e !important; /* 深色背景 */
  color: #dcdcdc !important;           /* 浅色字体 */
}

/* 如果需要滚动条样式 */
.ai-summary-dialog pre {
  overflow-x: auto;
  padding: 12px;
  border-radius: 6px;
}
}
