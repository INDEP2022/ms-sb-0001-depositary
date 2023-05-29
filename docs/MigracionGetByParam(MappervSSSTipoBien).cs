        public IEnumerable<vSSSTipoBien> GetByParam(vSSSTipoBien item)
        {

            string strSQL = "";
            string strFileName = System.Web.HttpContext.Current.Server.MapPath(@"~/Operacion/Bienes/QUERYSOleDb.TXT");
            string strCommand = "";

            try
            {
                strCommand = GetCommand.getQuery(strFileName, "63");

                strSQL = "select distinct no_clasif_bien, no_ssubtipo, no_sssubtipo, desc_sssubtipo ";
                strSQL += "from V_TIPO_BIEN ";
                strSQL += "where ";
                if (item.no_tipo != 0)
                    strSQL += " no_tipo = " + item.no_tipo.ToString();
                if (item.no_subtipo != 0)
                    strSQL += " and no_subtipo = " + item.no_subtipo.ToString();
                if (item.no_ssubtipo != 0)
                    strSQL += " and no_ssubtipo = " + item.no_ssubtipo.ToString();
                strSQL += " order by desc_sssubtipo";

                //if (strCommand.Trim() != "")
                //    strSQL = strCommand;

                using (_connection = new OleDbConnection(StringConnection))
                {
                    _connection.Open();

                    var lista = Dapper.SqlMapper.Query<vSSSTipoBien>(
                                                _connection,
                                                strSQL,
                                                null, null, commandType: CommandType.Text
                                            );

                    _listaResultados = lista;
                }
            }
            catch (OleDbException ex)
            {
                throw ex;
            }

            return _listaResultados;
        }
