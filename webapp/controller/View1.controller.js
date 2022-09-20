sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller コントローラ
     * @param {typeof sap.m.MessageToast} MessageToast メッセージトースト
     * @param {typeof sap.ui.model.json.JSONModel} JSONModel JSONモデル
     */
    function ( Controller, MessageToast, JSONModel ) {
        "use strict";

        /** フォーム用モデル */
        var formModel = new JSONModel();

        /** テーブル用モデル */
        var tableModel = new JSONModel();

        return Controller.extend( "apppref.controller.View1", {
            /**
             * 初期化する。
             */
            onInit: function () {
                // フォーム用モデルの初期化
                var formData = {
                    code: "",
                    name: ""
                };
                formModel.setData( formData );

                // ビューへのフォーム用モデル設定
                var view = this.getView();
                view.setModel( formModel, "form" );

                // テーブル用モデルの初期化
                var tableData = [];
                tableModel.setData( tableData );

                // ビューへのテーブル用モデル設定
                this.getView().setModel( tableModel, "covid19" );
            },

            /**
             * 検索ボタンの押下イベントを処理する。
             * @param {typeof sap.ui.base.Event} event イベント
             */
            onPressSearch: function ( event ) {
                // フォーム用データの取得
                var formData = formModel.getData();

                // テーブルデータ読込メソッド呼び出し情報の取得
                var loadTableData = this.loadTableData;
                var self = this;

                // 都道府県情報取得APIの呼び出し
                $.ajax( {
                    url: this.getFullUrl( "pref/prefecture/" + formData.code ),
                    method: "GET",
                    async: false,
                    dataType: "json"
                } ).done( function( data, status, xhr ) {
                    // 都道府県名の設定
                    formData.name = data.name;
                    formModel.setData( formData );

                    // テーブルデータの読み込み
                    loadTableData( self, formData.code );
                } ).fail( function( xhr, status, error ) {
                    // エラーの表示
                    MessageToast.show( "status=" + xhr.status + " " + error );
                } );
            },

            /**
             * 新型コロナ情報用テーブルデータを読み込む。
             * @param {object} self thisオブジェクト
             * @param {string} code 都道府県コード
             */
            loadTableData: function ( self, code ) {
                // 新型コロナ情報取得APIの呼び出し
                $.ajax( {
                    url: self.getFullUrl( "pref/covid19/" + code ),
                    method: "GET",
                    async: false,
                    dataType: "json"
                } ).done( function( data, status, xhr ) {
                    // テーブル用モデルへの新型コロナ情報の設定
                    tableModel.setData( data );

                    // 件数の設定
                    var countObj = self.getView().byId( "count" );
                    countObj.setText( data.length );
                } ).fail( function( xhr, status, error ) {
                    // エラーの表示
                    MessageToast.show( "status=" + xhr.status + " " + error );
                } );
            },

            /**
             * 相対URLをフルURLに変換して返す。
             * @param {string} url 相対URL
             * @return {string} フルURL
             */
            getFullUrl: function ( url ) {
                // アプリパスの取得
                var appId = this.getOwnerComponent().getManifestEntry( "/sap.app/id" );
                var appPath = appId.replaceAll( ".", "/" );

                // モジュールパスの取得
                var appModulePath = jQuery.sap.getModulePath( appPath );

                // フルURLの生成
                return appModulePath + "/" + url;
            }
        });
    });
